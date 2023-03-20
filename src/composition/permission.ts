/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useStore } from '@/store';
import { Plugin } from '@/types/plugin';
import { Matrix, Vector } from '@/types/prometheus';
import { Auth } from '@/types/role';

const store = useStore();

export const useEnvironmentRole = (): string => {
  if (store.state.Admin) return 'sys';
  if (useTenantRole() === 'admin') return 'tenantadmin';
  if (useProjectRole() === 'admin') return 'projectadmin';
  if (useProjectRole() === 'ops') return 'projectops';
  const role: Auth = store.state.Auth?.environments?.find((t: Auth) => {
    return t.id === store.getters.Environment().ID;
  });
  if (role) {
    return role.role;
  }
  return 'reader';
};

export const useProjectRole = (): string => {
  if (store.state.Admin) return 'sys';
  if (useTenantRole() === 'admin') return 'tenantadmin';
  const role: Auth = store.state.Auth?.projects?.find((t: Auth) => {
    return t.id === store.getters.Project().ID;
  });
  if (role) {
    return role.role;
  }
  return '';
};

export const useTenantRole = (): string => {
  if (store.state.Admin) return 'sys';
  const role: Auth = store.state.Auth?.tenant?.find((t: Auth) => {
    return t.id === store.getters.Tenant().ID;
  });
  if (role) {
    return role.role;
  }
  return 'ordinary';
};

export const useVirtualSpaceRole = (): string => {
  if (store.state.Admin) return 'sys';
  const role: Auth = store.state.Auth?.virtualSpaces?.find((t: Auth) => {
    return t.id === store.getters.VirtualSpace().ID;
  });
  if (role) {
    return role.role;
  }
  return 'normal';
};

export const useEnvironmentAllow = (env: string = undefined): boolean => {
  return (
    store.state.Auth?.environments?.findIndex((t) => {
      if (env) {
        return t.name === env && t.isAdmin;
      } else {
        return t.id === store.getters.Environment().ID && t.isAdmin;
      }
    }) > -1 ||
    store.state.Admin ||
    useProjectAllow() ||
    useTenantAllow()
  );
};

export const useProjectAllow = (project: string = undefined): boolean => {
  return (
    store.state.Auth?.projects?.findIndex((t) => {
      if (project) {
        return t.name === project && (t.isAdmin || t.role === 'ops');
      } else {
        return t.id === store.getters.Project().ID && (t.isAdmin || t.role === 'ops');
      }
    }) > -1 ||
    store.state.Admin ||
    useTenantAllow()
  );
};

export const useTenantAllow = (tenant: string = undefined): boolean => {
  return (
    store.state.Auth?.tenant?.findIndex((t) => {
      if (tenant) {
        return t.name === tenant && t.isAdmin;
      } else {
        return t.id === store.getters.Tenant().ID && t.isAdmin;
      }
    }) > -1 || store.state.Admin
  );
};

export const useVirtualSpaceAllow = (virtualspace: string = undefined): boolean => {
  return (
    store.state.Auth?.virtualSpaces?.findIndex((t) => {
      if (virtualspace) {
        return t.isAdmin && t.name === virtualspace;
      } else {
        return t.isAdmin && t.id === store.getters.VirtualSpace().ID;
      }
    }) > -1 || store.state.Admin
  );
};

export const useMatrixWithPermission = async (cluster: string, query: any = {}): Promise<Matrix[]> => {
  if (store.state.Plugins?.['monitoring'] || query.pass) {
    const data = await new Matrix().getMatrix(cluster, query);
    return data;
  }
  return [];
};

export const useVectorWithPermission = async (cluster: string, query: any = {}): Promise<Vector[]> => {
  if (store.state.Plugins?.['monitoring'] || query.pass) {
    const data = await new Vector().getVector(cluster, query);
    return data;
  }
  return [];
};

export const usePluginPass = async (cluster: string, plugins: string[] = []): Promise<string[]> => {
  if (plugins && plugins.length === 0) return [];
  const data = await new Plugin().getPluginList(cluster, {
    simple: true,
    noprocessing: true,
  });
  const notPassPluins = plugins.filter((p) => {
    return !data[p];
  });
  return notPassPluins;
};
