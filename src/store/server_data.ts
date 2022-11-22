import {
  clusterSelectData,
  projectEnvironmentSelectData,
  tenantProjectSelectData,
  tenantSelectData,
  userTenantSelectData,
  virtualSpaceSelectData,
} from '@/api';

export async function useVirtualSpace(): Promise<{ [key: string]: string | number }[]> {
  const data: { [key: string]: any } = await virtualSpaceSelectData({ noprocessing: true });
  const virtualSpaceSelect: { [key: string]: string | number }[] = [];
  data.List.forEach((r: any): void => {
    virtualSpaceSelect.push({
      VirtualSpaceName: r.VirtualSpaceName,
      ID: r.ID,
    });
  });
  return virtualSpaceSelect;
}

export async function useCluster(): Promise<{ [key: string]: string | number }[]> {
  const data: { [key: string]: any } = await clusterSelectData({ noprocessing: true });
  const clusterSelect: { [key: string]: string | number }[] = [];
  data.List.forEach((c: any): void => {
    clusterSelect.push({
      ClusterName: c.ClusterName,
      Version: c.Version,
      ID: c.ID,
    });
  });
  return clusterSelect;
}

export async function useTenant(admin: boolean, userid: number): Promise<{ [key: string]: string | number }[]> {
  let data: { [key: string]: any } = {};
  if (admin) {
    data = await tenantSelectData({ noprocessing: true });
  } else {
    data = await userTenantSelectData(userid, {
      noprocessing: true,
    });
  }
  const tenantSelect: { [key: string]: string | number }[] = [];
  data.List.forEach((tenant: any): void => {
    if (tenant.IsActive && ((tenant.Clusters && tenant.Clusters.length > 0) || tenant.ResourceQuotas)) {
      tenantSelect.push({
        TenantName: tenant.TenantName,
        ID: tenant.ID,
      });
    }
  });
  return tenantSelect;
}

export async function useProject(tenantid: number): Promise<{ [key: string]: string | number }[]> {
  const data: { [key: string]: any } = await tenantProjectSelectData(tenantid, {
    noprocessing: true,
  });
  const tenantProjectSelect: { [key: string]: string | number }[] = [];
  data.List.forEach((p: any): void => {
    tenantProjectSelect.push({
      ProjectName: p.ProjectName,
      ID: p.ID,
    });
  });
  return tenantProjectSelect;
}

export async function useEnvironment(projectid: number): Promise<{ [key: string]: string | number }[]> {
  const data: { [key: string]: any } = await projectEnvironmentSelectData(projectid, {
    noprocessing: true,
  });
  const projectEnvironmentSelect: { [key: string]: string | number }[] = [];
  data.List.forEach((ns: any): void => {
    projectEnvironmentSelect.push({
      EnvironmentName: ns.EnvironmentName,
      ID: ns.ID,
      Namespace: ns.Namespace,
      ClusterName: ns.Cluster.ClusterName,
      ClusterID: ns.ClusterID,
      Type: ns.MetaType,
      Version: ns.Cluster.Version,
    });
  });
  return projectEnvironmentSelect;
}
