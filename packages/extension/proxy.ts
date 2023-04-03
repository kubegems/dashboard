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
import { getCurrentInstance } from 'vue';
import { VueMetaPlugin } from 'vue-meta';
import VueRouter, { Route } from 'vue-router';
import { Framework } from 'vuetify';

export function useRoute(): Route {
  const { proxy } = getCurrentInstance();
  return proxy.$route;
}
export function useRouter(): VueRouter {
  const { proxy } = getCurrentInstance();
  return proxy.$router;
}

export function useVuetify(): Framework {
  const { proxy } = getCurrentInstance();
  return proxy.$vuetify;
}

export function useMeta(): VueMetaPlugin {
  const { proxy } = getCurrentInstance();
  return proxy.$meta();
}

type copyHandler = (text: string, container?: object | HTMLElement) => Promise<any>;
export function useCopy(): copyHandler {
  const { proxy } = getCurrentInstance();
  return proxy.$copyText;
}

export function useForceUpdate(): () => void {
  const { proxy } = getCurrentInstance();
  return proxy.$forceUpdate;
}
