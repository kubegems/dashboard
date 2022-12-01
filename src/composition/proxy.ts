import { getCurrentInstance } from 'vue';
import { VueMetaPlugin } from 'vue-meta';
import { Framework } from 'vuetify';

export function useVuetify(): Framework {
  const { proxy } = getCurrentInstance();
  return proxy.$vuetify;
}

export function useMeta(): VueMetaPlugin {
  const { proxy } = getCurrentInstance();
  return proxy.$meta();
}
