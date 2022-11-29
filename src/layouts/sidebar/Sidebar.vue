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
    :color="SidebarColor"
    :dark="SidebarColor !== 'white'"
    :expand-on-hover="expandOnHover"
    height="100%"
    :mini-variant.sync="mini"
    mini-variant-width="64"
    mobile-breakpoint="960"
    width="220"
    @transitionend="transitionend"
    @update:mini-variant="updateSidebar"
  >
    <v-list class="ma-0 pa-0">
      <v-list-item-group color="white" @change="onNavChange">
        <v-list-item class="py-3" @click="expand = !expand">
          <v-list-item-content class="primary--text">
            <v-list-item-title class="text-subtitle-1 text-center title-font-weight">
              <v-flex class="float-left">
                <Icon :icon="module.icon" :style="{ width: `2.2rem`, height: `2.2rem`, fontSize: `2.2rem` }" />
              </v-flex>
              <v-flex v-if="!hide" class="float-left title-line-height ml-3">
                {{ $t(`sidebar.${module.text}`) }}
              </v-flex>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="ml-0">
            <v-btn v-if="!expand" icon>
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
      <v-list v-show="expand" id="expand_list" class="ma-0 pa-0" dense>
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
              <v-list-item-title v-text="$t(`sidebar.${item.text}`)" />
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
              <v-subheader v-if="item.meta.header && (!expandOnHover || mouseovered)" class="text-truncate">
                {{ $t(item.meta.header) }}
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

<script>
  import { mapGetters, mapState } from 'vuex';

  import { SIDEBAR_ITEMS } from './sidebar_items';

  export default {
    name: 'Sidebar',
    props: {
      expandOnHover: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        module: {},
        modules: [],
        expand: false,
        mouseovered: false,
        hide: false,
        mini: false,
      };
    },
    computed: {
      ...mapState(['SidebarColor', 'SidebarBg', 'AdminViewport', 'Scale', 'Plugins', 'Edge']),
      ...mapGetters(['VirtualSpace', 'Tenant', 'Environment', 'Project', 'Cluster']),
      SidebarDrawer: {
        get() {
          return this.$store.state.SidebarDrawer;
        },
        set(val) {
          this.$store.commit('SET_SIDEBAR_DRAWER', val);
        },
      },
      items() {
        const sidebarItem = this.$router.options.routes.find((r) => {
          return this.$route.meta.rootName && r.name === this.$route.meta.rootName;
        });
        return sidebarItem.children;
      },
      height() {
        return window.innerHeight / this.Scale;
      },
    },
    watch: {
      '$vuetify.breakpoint.smAndDown'(val) {
        this.$emit('update:expandOnHover', !val);
      },
      '$route.path': {
        handler: function () {
          if (this.$route.params.tenant) {
            this.$store.commit('SET_ADMIN_VIEWPORT', false);
          } else if (this.$route.params.cluster || this.$route.meta.admin) {
            this.$store.commit('SET_ADMIN_VIEWPORT', true);
          }
          this.reloadSidebar();
          this.expand = false;
        },
        deep: true,
        immediate: true,
      },
      expandOnHover() {
        this.mini = this.expandOnHover;
        this.hide = this.expandOnHover;
      },
    },
    methods: {
      onNavChange() {
        if (this.expand) {
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
      },
      required(required) {
        let pass = true;
        if (required === undefined) return pass;
        required.forEach((r) => {
          if (!this.$route.params[r]) {
            pass = false;
            return;
          }
        });
        return pass;
      },
      pluginPass(dependencies) {
        let pass = true;
        if (dependencies === undefined) return pass;
        dependencies.forEach((d) => {
          if (!this.Plugins[d]) {
            pass = false;
            return;
          }
        });
        return pass;
      },
      passEdge(edge) {
        if (edge === undefined) return true;
        if (this.AdminViewport) {
          if (this.Edge) return edge;
          return true;
        } else {
          return edge && this.Environment().AllowEdgeRegistration;
        }
      },
      reloadSidebar() {
        try {
          const module = this.$route.path.split('/')[1];
          this.modules = this.getModules();
          const m = this.modules.find((item) => {
            return item.value === module;
          });
          if (!m) this.module = this.modules[0];
          else {
            this.module = m;
          }
        } catch {
          this.module = this.modules[0];
        }
      },
      getModules() {
        let sidebar = [];
        if (this.AdminViewport) {
          sidebar = SIDEBAR_ITEMS.filter((item) => {
            return item.admin || (item.admin === 'all' && this.$route.meta.rootName !== 'microservice');
          });
        } else {
          // 特殊判断，可待优化
          sidebar = SIDEBAR_ITEMS.filter((item) => {
            return (
              !item.required ||
              (item.required &&
                this.$route.params &&
                item.required.sort().join('') ===
                  Object.keys(this.$route.params)
                    .filter((p) => {
                      return p !== 'name';
                    })
                    .sort()
                    .join('')) ||
              ((this.$route.meta.rootName === 'entry-microservice' || this.$route.meta.rootName === 'microservice') &&
                item.required.sort().join('') === ['tenant'].join(''))
            );
          }).filter((item) => {
            return !item.admin || (item.admin === 'all' && this.$route.meta.rootName !== 'microservice');
          });
        }
        return sidebar;
      },
      switchModule(module) {
        this.module = module;
        this.expand = !this.expand;
        if (this.module.sidebar === 'dashboard' || this.module.sidebar === 'workspaceobserve') {
          this.$router.push({
            name: this.module.value,
            params: { tenant: this.Tenant().TenantName },
          });
        } else if (this.module.sidebar === 'projectspace') {
          this.$router.push({
            name: this.module.value,
            params: {
              tenant: this.Tenant().TenantName,
              project: this.Project().ProjectName,
            },
          });
        } else if (this.module.sidebar === 'workspace') {
          this.$router.push({
            name: this.module.value,
            params: {
              tenant: this.Tenant().TenantName,
              project: this.Project().ProjectName,
              environment: this.Environment().EnvironmentName,
            },
          });
        } else if (this.module.sidebar === 'cluster') {
          this.$router.push({
            name: this.module.value,
            params: {
              cluster: this.Cluster().ClusterName,
            },
          });
        } else {
          this.$router.push({
            name: this.module.value,
          });
        }
      },
      updateSidebar() {
        this.expand = false;
        this.hide = true;
      },
      transitionend() {
        this.mouseovered = this.$refs.sidebar.$el.style.width === '200px';
        if (this.mouseovered) {
          this.hide = false;
        }
      },
    },
  };
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
