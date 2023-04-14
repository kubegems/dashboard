<!--
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
-->

<template>
  <v-navigation-drawer
    id="main-sidebar"
    ref="sidebar"
    v-model="SidebarDrawer"
    app
    clipped
    :color="store.state.SidebarColor"
    :dark="store.state.SidebarColor !== 'white'"
    :expand-on-hover="expandOnHover"
    height="100%"
    :mini-variant.sync="state.mini"
    mini-variant-width="64"
    mobile-breakpoint="960"
    width="220"
    @transitionend="transitionend"
    @update:mini-variant="updateSidebar"
  >
    <v-list class="ma-0 pa-0">
      <v-list-item-group color="white" @change="navChanged">
        <v-list-item class="py-3" @click="state.expand = !state.expand">
          <v-list-item-content class="primary--text">
            <v-list-item-title class="text-subtitle-1 text-center title-font-weight">
              <v-flex class="float-left">
                <Icon :icon="module.icon" :style="{ width: `2.2rem`, height: `2.2rem`, fontSize: `2.2rem` }" />
              </v-flex>
              <v-flex v-if="!state.hide" class="float-left title-line-height ml-3">
                {{ i18n.t(`sidebar.${module.text}`) }}
              </v-flex>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="ml-0">
            <v-btn v-if="!state.expand" icon>
              <v-icon color="primary lighten-1"> mdi-chevron-down </v-icon>
            </v-btn>
            <v-btn v-else icon>
              <v-icon color="primary lighten-1"> mdi-chevron-up </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <v-expand-transition>
      <v-list v-show="state.expand" id="expand_list" class="ma-0 pa-0" dense>
        <v-list-item-group color="primary">
          <v-list-item
            v-for="item in modules"
            :key="item.value"
            :class="{ 'px-9': true, primary: item.value === module.value }"
            exact
            :style="{
              color: item.value === module.value ? 'white !important' : 'rgba(0, 0, 0, 0.7) !important',
            }"
            @click="switchModule(item)"
          >
            <v-list-item-icon>
              <Icon :icon="item.icon" :style="{ width: `1.5rem`, height: `1.5rem`, fontSize: `1.5rem` }" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="i18n.t(`sidebar.${item.text}`)" />
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-expand-transition>

    <v-divider />

    <v-list class="mt-0" dense expand nav :style="`max-height: ${height}px;overflow-y: auto;`">
      <template v-for="(item, i) in items">
        <template v-if="required(item.meta.required)">
          <!---If Sidebar Caption -->
          <v-row
            v-if="item.meta.header && passEdge(item.meta.edge)"
            :key="item.meta.header"
            align="center"
            class="py-2"
          >
            <v-col class="pa-1" cols="12">
              <v-subheader v-if="item.meta.header && (!expandOnHover || state.mouseovered)" class="text-truncate">
                {{ i18n.t(item.meta.header) }}
              </v-subheader>
              <v-subheader v-else class="text-truncate">
                <v-icon class="dot" x-small> mdi-stop </v-icon>
              </v-subheader>
            </v-col>
          </v-row>
        </template>
        <!---If Sidebar Caption -->
        <BaseItemGroup
          v-if="item.children && required(item.meta.required) && passEdge(item.meta.edge)"
          :key="`group-${i}`"
          :item="item"
        />

        <BaseItem
          v-else-if="
            !item.children &&
            (item.mata.show || (pluginPass(item.meta.dependencies) && item.meta.pluginOpenShow)) &&
            passEdge(item.meta.edge)
          "
          :key="`item-${i}`"
          :item="item"
        />
      </template>
      <!---Sidebar Items -->
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useVuetify } from '@kubegems/extension/proxy';
  import { useMeta, useParams, usePath, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { computed, reactive, ref, watch } from 'vue';

  import BaseItem from '../baseComponents/BaseItem.vue';
  import BaseItemGroup from '../baseComponents/BaseItemGroup.vue';

  const props = withDefaults(
    defineProps<{
      expandOnHover?: boolean;
      sidebarItems: any[];
      routes: any[];
    }>(),
    {
      expandOnHover: false,
      sidebarItems: undefined,
      routes: undefined,
    },
  );

  const store = useStore();
  const i18n = useGlobalI18n();
  const meta = useMeta();
  const routeParams = useParams();
  const path = usePath();
  const router = useRouter();
  const vuetify = useVuetify();

  const state = reactive({
    expand: false,
    mouseovered: false,
    hide: false,
    mini: false,
  });

  const SidebarDrawer = computed({
    get: () => store.state.SidebarDrawer,
    set: (val) => {
      store.commit('SET_SIDEBAR_DRAWER', val);
    },
  });

  const items = computed(() => {
    const sidebarItem = props.routes.find((r) => {
      return meta.value.rootName && r.name === meta.value.rootName;
    });
    return sidebarItem.children;
  });

  const height = computed(() => {
    return window.innerHeight / store.state.Scale;
  });

  const navChanged = () => {
    if (state.expand) {
      // v-item--active v-list-item--active
      // 导航栏样式优化，vuetify bug 后续升级
      const listItems = document.querySelectorAll('#expand_list .v-list-item');
      if (listItems && listItems.length > 0) {
        for (const index in listItems) {
          if (listItems[index].classList) {
            listItems[index].classList.remove('v-item--active');
            listItems[index].classList.remove('v-list-item--active');
          }
        }
      }
    }
  };

  const required = (required: string[]): boolean => {
    let pass = true;
    if (required === undefined) return pass;
    required.forEach((r) => {
      if (!routeParams.value[r]) {
        pass = false;
        return;
      }
    });
    return pass;
  };

  const pluginPass = (dependencies: string[]): boolean => {
    let pass = true;
    if (dependencies === undefined) return pass;
    dependencies.forEach((d) => {
      if (!store.state.Plugins[d]) {
        pass = false;
        return;
      }
    });
    return pass;
  };

  const passEdge = (edge: string): boolean | string => {
    if (edge === undefined) return true;
    if (store.state.AdminViewport) {
      if (store.state.Edge) return edge;
      return true;
    } else {
      if (store.state.Edge) return edge && store.getters.Environment().AllowEdgeRegistration;
      else return !Boolean(edge) || (edge === 'check' && store.getters.Environment().AllowEdgeRegistration);
    }
  };

  const module = ref<{ [key: string]: any }>({});
  const modules = ref([]);

  const reloadSidebar = (): void => {
    try {
      const mod = path.value.split('/')[1];
      modules.value = getModules();
      const m = modules.value.find((item) => {
        return item.value === mod;
      });
      if (!m) module.value = modules.value[0];
      else {
        module.value = m;
      }
    } catch {
      module.value = modules.value[0];
    }
  };

  const getModules = () => {
    let sidebar = [];
    if (store.state.AdminViewport) {
      sidebar = props.sidebarItems.filter((item) => {
        return item.admin || (item.admin === 'all' && meta.value.rootName !== 'microservice');
      });
    } else {
      // 特殊判断，可待优化
      sidebar = props.sidebarItems
        .filter((item) => {
          return (
            !item.required ||
            (item.required &&
              routeParams.value &&
              item.required.sort().join('') ===
                Object.keys(routeParams.value)
                  .filter((p) => {
                    return p !== 'name';
                  })
                  .sort()
                  .join('')) ||
            ((meta.value.rootName === 'entry-microservice' || meta.value.rootName === 'microservice') &&
              item.required.sort().join('') === ['tenant'].join(''))
          );
        })
        .filter((item) => {
          return !item.admin || (item.admin === 'all' && meta.value.rootName !== 'microservice');
        });
    }
    return sidebar;
  };

  const switchModule = (mod: any): void => {
    module.value = mod;
    state.expand = !state.expand;
    if (module.value.sidebar === 'dashboard' || module.value.sidebar === 'workspaceobserve') {
      router.push({
        name: module.value.value,
        params: { tenant: store.getters.Tenant().TenantName },
      });
    } else if (module.value.sidebar === 'projectspace') {
      router.push({
        name: module.value.value,
        params: {
          tenant: store.getters.Tenant().TenantName,
          project: store.getters.Project().ProjectName,
        },
      });
    } else if (module.value.sidebar === 'workspace') {
      router.push({
        name: module.value.value,
        params: {
          tenant: store.getters.Tenant().TenantName,
          project: store.getters.Project().ProjectName,
          environment: store.getters.Environment().EnvironmentName,
        },
      });
    } else if (module.value.sidebar === 'cluster') {
      router.push({
        name: module.value.value,
        params: {
          cluster: store.getters.Cluster().ClusterName,
        },
      });
    } else {
      router.push({
        name: module.value.value,
      });
    }
  };

  const updateSidebar = () => {
    state.expand = false;
    state.hide = true;
  };

  const sidebar = ref(null);
  const transitionend = () => {
    state.mouseovered = sidebar.value.$el.style.width === '220px';
    if (state.mouseovered) {
      state.hide = false;
    }
  };

  const emit = defineEmits(['update:expandOnHover']);
  watch(
    () => vuetify.breakpoint.smAndDown,
    async (newValue) => {
      emit('update:expandOnHover', !newValue);
    },
    {
      deep: true,
    },
  );

  watch(
    () => path,
    async () => {
      if (routeParams.value.tenant) {
        store.commit('SET_ADMIN_VIEWPORT', false);
      } else if (routeParams.value.cluster || meta.value.admin) {
        store.commit('SET_ADMIN_VIEWPORT', true);
      }
      reloadSidebar();
      state.expand = false;
    },
    {
      deep: true,
      immediate: true,
    },
  );

  watch(
    () => props.expandOnHover,
    async (newValue) => {
      state.mini = newValue;
      state.hide = newValue;
    },
    {
      deep: true,
    },
  );
</script>

<style lang="scss">
  #main-sidebar {
    box-shadow: 1px 0 20px rgba(0, 0, 0, 0.08);
    -webkit-box-shadow: 1px 0 20px rgba(0, 0, 0, 0.08);
    .v-navigation-drawer__border {
      display: none;
    }
    .v-list {
      padding: 8px 15px;
    }
    .v-list-item {
      &__icon--text,
      &__icon:first-child {
        justify-content: center;
        text-align: center;
        width: 20px;
      }
    }
    ::-webkit-scrollbar {
      width: 0 !important;
    }

    overflow: -moz-scrollbars-none;
    -ms-overflow-style: none;
    scrollbar-width: 0 !important;
  }
  .v-menu-full-content {
    left: 0 !important;
  }
  .full-height {
    height: 64px;
    line-height: 64px !important;
  }
  .title-font-weight {
    font-weight: 500 !important;
  }
  .title-line-height {
    line-height: 40px;
  }
  .dot {
    margin: 0 auto;
  }
</style>
