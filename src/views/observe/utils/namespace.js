import { tenantEnvironmentSelectData, namespaceSelectData } from '@/api';

async function getNamespaceItems(admin, cluster, tenant) {
  let items = [];
  if (admin && cluster) {
    const data = await namespaceSelectData(cluster, { size: 1000, noprocessing: true });
    items = (data.List || []).map((item) => {
      return {
        text: item.metadata.name,
        value: item.metadata.name,
      };
    });
  } else {
    const data = await tenantEnvironmentSelectData(tenant, { size: 1000, noprocessing: true });
    items = (data.List || []).map((item) => {
      return {
        text: item.Namespace,
        value: item.Namespace,
      };
    });
  }
  return items;
}

export default getNamespaceItems;
