import { getCurrentInstance } from 'vue';
import VueRouter, { Route } from 'vue-router';

export function useRoute(): Route {
  const { proxy } = getCurrentInstance();
  return proxy.$route;
}
export function useRouter(): VueRouter {
  const { proxy } = getCurrentInstance();
  return proxy.$router;
}
