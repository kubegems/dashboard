import { useStore } from '@/store';
import { Auth } from '@/types/role';

const store = useStore();

export const useEnvironmentRole = (): string => {
  if (store.state.Admin) return 'sys';
  if (useTenantRole() === 'admin') return 'tenantadmin';
  if (useProjectRole() === 'admin') return 'projectadmin';
  if (useProjectRole() === 'ops') return 'projectops';
  const role: Auth = store.state.Auth.environments.find((t: Auth) => {
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
  const role: Auth = store.state.Auth.projects.find((t: Auth) => {
    return t.id === store.getters.Project().ID;
  });
  if (role) {
    return role.role;
  }
  return '';
};

export const useTenantRole = (): string => {
  if (store.state.Admin) return 'sys';
  const role: Auth = store.state.Auth.tenant.find((t: Auth) => {
    return t.id === store.getters.Tenant().ID;
  });
  if (role) {
    return role.role;
  }
  return 'ordinary';
};

export const useVirtualSpaceRole = (): string => {
  if (store.state.Admin) return 'sys';
  const role: Auth = store.state.Auth.virtualSpaces.find((t: Auth) => {
    return t.id === store.getters.VirtualSpace().ID;
  });
  if (role) {
    return role.role;
  }
  return 'normal';
};
