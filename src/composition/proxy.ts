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

type copyHandler = (
  text: string,
  container?: object | HTMLElement,
) => Promise<{
  action: string;
  text: string;
  trigger: String | HTMLElement | HTMLCollection | NodeList;
  clearSelection: () => void;
}>;
export function useCopy(): copyHandler {
  const { proxy } = getCurrentInstance();
  return proxy.$copyText;
}
