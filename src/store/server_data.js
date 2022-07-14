import {
  clusterSelectData,
  projectEnvironmentSelectData,
  tenantProjectSelectData,
  tenantSelectData,
  userTenantSelectData,
  virtualSpaceSelectData,
} from '@/api';

export async function getVirtualSpaceSelectData() {
  const data = await virtualSpaceSelectData({ noprocessing: true });
  const virtualSpaceSelect = [];
  data.List.forEach((r) => {
    virtualSpaceSelect.push({
      VirtualSpaceName: r.VirtualSpaceName,
      ID: r.ID,
    });
  });
  return virtualSpaceSelect;
}

export async function getClusterSelectData() {
  const data = await clusterSelectData({ noprocessing: true });
  const clusterSelect = [];
  data.List.forEach((c) => {
    clusterSelect.push({
      ClusterName: c.ClusterName,
      Version: c.Version,
      ID: c.ID,
    });
  });
  return clusterSelect;
}

export async function getTenantSelectData(admin, userid) {
  let data = {};
  if (admin) {
    data = await tenantSelectData({ noprocessing: true });
  } else {
    data = await userTenantSelectData(userid, {
      noprocessing: true,
    });
  }
  const tenantSelect = [];
  data.List.forEach((tenant) => {
    if (tenant.IsActive && ((tenant.Clusters && tenant.Clusters.length > 0) || tenant.ResourceQuotas)) {
      tenantSelect.push({
        TenantName: tenant.TenantName,
        ID: tenant.ID,
      });
    }
  });
  return tenantSelect;
}

export async function getProjectSelectData(tenantid) {
  const data = await tenantProjectSelectData(tenantid, {
    noprocessing: true,
  });
  const tenantProjectSelect = [];
  data.List.forEach((p) => {
    tenantProjectSelect.push({
      ProjectName: p.ProjectName,
      ID: p.ID,
    });
  });
  return tenantProjectSelect;
}

export async function getEnvironmentSelectData(projectid) {
  const data = await projectEnvironmentSelectData(projectid, {
    noprocessing: true,
  });
  const projectEnvironmentSelect = [];
  data.List.forEach((ns) => {
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
