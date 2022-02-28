<template>
  <v-navigation-drawer
    id="main-sidebar"
    ref="sidebar"
    v-model="SidebarDrawer"
    :dark="SidebarColor !== 'white'"
    :color="SidebarColor"
    mobile-breakpoint="960"
    mini-variant-width="64"
    clipped
    :expand-on-hover="expandOnHover"
    app
    width="200"
    height="100%"
    @transitionend="transitionend"
    @update:mini-variant="updateSidebar"
  >
    <v-list class="ma-0 pa-0">
      <v-list-item-group color="white">
        <v-list-item
          class="py-3"
          @click="expand = !expand"
        >
          <v-list-item-content class="primary--text">
            <v-list-item-title
              class="text-subtitle-1 text-center title-font-weight"
            >
              <v-flex class="float-left">
                <Icon
                  :icon="module.icon"
                  style="width: 2rem; height: 2rem; font-size: 2rem;"
                />
              </v-flex>
              <v-flex
                v-if="!hide"
                class="float-left title-line-height ml-3"
              >
                {{ module.text }}
              </v-flex>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              v-if="!expand"
              icon
            >
              <v-icon
                small
                color="primary lighten-1"
              >
                fas fa-angle-down
              </v-icon>
            </v-btn>
            <v-btn
              v-else
              icon
            >
              <v-icon
                small
                color="primary lighten-1"
              >
                fas fa-angle-up
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <v-expand-transition>
      <v-list
        v-show="expand"
        dense
        class="ma-0 pa-0"
      >
        <v-list-item-group color="primary">
          <v-list-item
            v-for="item in modules"
            :key="item.value"
            exact
            :class="item.value === module.value ? `px-9 primary` : `px-9`"
            :style="
              item.value === module.value
                ? `color: white !important;`
                : `color: rgba(0, 0, 0, 0.7) !important;`
            "
            @click="switchModule(item)"
          >
            <v-list-item-icon>
              <Icon
                :icon="item.icon"
                style="width: 1.5rem; height: 1.5rem; font-size: 1.5rem;"
              />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.text" />
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-expand-transition>

    <v-divider />

    <v-list
      expand
      nav
      class="mt-0"
      dense
      :style="`max-height: ${height}px;overflow-y: auto;`"
    >
      <template v-for="(item, i) in items">
        <!---If Sidebar Caption -->
        <v-row
          v-if="item.meta.header"
          :key="item.meta.header"
          align="center"
          class="py-2"
        >
          <v-col
            v-if="required(item.meta.required)"
            cols="12"
            class="pa-1"
          >
            <v-subheader
              v-if="item.meta.header && (!expandOnHover || mouseovered)"
              class="text-truncate"
            >
              {{ item.meta.header }}
            </v-subheader>
            <v-subheader
              v-else
              class="text-truncate"
            >
              <v-icon
                x-small
                class="dot"
              >
                mdi-stop
              </v-icon>
            </v-subheader>
          </v-col>
        </v-row>
        <!---If Sidebar Caption -->
        <BaseItemGroup
          v-if="item.children && pluginPass(item.meta.dependencies) && required(item.meta.required)"
          :key="`group-${i}`"
          :item="item"
        />

        <BaseItem
          v-else-if="!item.children && item.mata.show && pluginPass(item.meta.dependencies)"
          :key="`item-${i}`"
          :item="item"
        />
      </template>
      <!---Sidebar Items -->
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Sidebar',
  props: {
    expandOnHover: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    module: {},
    modules: [],
    expand: false,
    mouseovered: false,
    hide: false,
  }),
  computed: {
    ...mapState(['SidebarColor', 'SidebarBg', 'AdminViewport', 'Scale', 'Plugins']),
    ...mapGetters([
      'VirtualSpace',
      'Tenant',
      'Environment',
      'Project',
      'Cluster',
    ]),
    SidebarDrawer: {
      get() {
        return this.$store.state.SidebarDrawer
      },
      set(val) {
        this.$store.commit('SET_SIDEBAR_DRAWER', val)
      },
    },
    items() {
      const sidebarItem = this.$router.options.routes.find(r => {
        return this.$route.meta.rootName &&
        r.name === this.$route.meta.rootName
      })
      if (sidebarItem) {
        return sidebarItem.children
      }
      return []
    },
    height() {
      return window.innerHeight / this.Scale
    },
  },
  watch: {
    '$vuetify.breakpoint.smAndDown'(val) {
      this.$emit('update:expandOnHover', !val)
    },
    '$route.path': {
      handler: function () {
        if (this.$route.params.tenant) {
          this.$store.commit('SET_ADMIN_VIEWPORT', false)
        } else if (this.$route.params.cluster || this.$route.meta.admin) {
          this.$store.commit('SET_ADMIN_VIEWPORT', true)
        }
        this.reloadSidebar()
        this.expand = false
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    required(required) {
      let pass = true
      if (required === undefined) return pass
      required.forEach(r => {
        if (!this.$route.params[r]) {
          pass = false
          return
        }
      })
      return pass
    },
    pluginPass(dependencies) {
      let pass = true
      if (dependencies === undefined) return pass
      dependencies.forEach(d => {
        if (!this.Plugins[d]) {
          pass = false
          return
        }
      })
      return pass
    },
    reloadSidebar() {
      try {
        const module = this.$route.path.split('/')[1]
        this.modules = this.getModules()
        const index = this.modules.findIndex((item) => {
          return item.value === module
        })
        if (index === -1) this.module = this.modules[0]
        else {
          this.module = this.modules[index]
        }
      } catch {
        this.module = this.modules[0]
      }
    },
    getModules() {
      let sidebar = []
      if (this.AdminViewport) {
        sidebar = [
          {
            text: '集群资源',
            sidebar: 'cluster',
            value: 'admin-workspace',
            icon: 'cib:kubernetes',
            index: 0,
          },
          {
            text: '可观测性',
            sidebar: 'observe',
            value: 'admin-observe',
            icon: 'ic:baseline-visibility',
            index: 2,
          },
          {
            text: '平台管理',
            sidebar: 'platform',
            value: 'platform',
            icon: 'cib:codesandbox',
            index: 3,
          },
        ]
      } else {
        if (
          (this.Environment().ID === 0 && this.Project().ID === 0) ||
          this.$route.name === 'resource-dashboard'
        ) {
          sidebar = [
            {
              text: '容器服务',
              sidebar: 'dashboard',
              value: 'resource-dashboard',
              icon: 'cib:kubernetes',
              index: 0,
            },
            {
              text: '可观测性',
              sidebar: 'workspaceobserve',
              value: 'observe',
              icon: 'ic:baseline-visibility',
              index: 2,
            },
          ]
        } else if (
          (this.Environment().ID === 0 && this.Project().ID !== 0) ||
          this.$route.name === 'project-detail'
        ) {
          sidebar = [
            {
              text: '容器服务',
              sidebar: 'projectspace',
              value: 'project-detail',
              icon: 'cib:kubernetes',
              index: 0,
            },
            {
              text: '可观测性',
              sidebar: 'workspaceobserve',
              value: 'observe',
              icon: 'ic:baseline-visibility',
              index: 2,
            },
          ]
        } else {
          sidebar = [
            {
              text: '容器服务',
              sidebar: 'workspace',
              value: 'environment-detail',
              icon: 'cib:kubernetes',
              index: 0,
            },
            {
              text: '可观测性',
              sidebar: 'workspaceobserve',
              value: 'observe',
              icon: 'ic:baseline-visibility',
              index: 2,
            },
          ]
        }
      }
      if (this.VirtualSpace().ID > 0) {
        sidebar.splice(1, 0, {
          text: '服务治理',
          sidebar: 'virtualspace',
          value: 'microservice',
          icon: 'file-icons:service-fabric',
          index: 1,
        })
      } else {
        sidebar.splice(1, 0, {
          text: '服务治理',
          sidebar: 'microservice',
          value: 'microservice',
          icon: 'file-icons:service-fabric',
          index: 1,
        })
      }
      return sidebar
    },
    switchModule(module) {
      this.module = module
      this.expand = !this.expand
      if (this.module.sidebar === 'dashboard') {
        this.$router.push({
          name: this.module.value,
          params: { tenant: this.Tenant().TenantName },
        })
      } else if (this.module.sidebar === 'projectspace') {
        this.$router.push({
          name: this.module.value,
          params: {
            tenant: this.Tenant().TenantName,
            project: this.Project().ProjectName,
          },
        })
      } else if (this.module.sidebar === 'workspace') {
        this.$router.push({
          name: this.module.value,
          params: {
            tenant: this.Tenant().TenantName,
            project: this.Project().ProjectName,
            environment: this.Environment().EnvironmentName,
          },
        })
      } else if (this.module.sidebar === 'workspaceobserve') {
        this.$router.push({
          name: this.module.value,
          params: {
            tenant: this.Tenant().TenantName,
          },
        })
      } else if (this.module.sidebar === 'cluster') {
        this.$router.push({
          name: this.module.value,
          params: {
            cluster: this.Cluster().ClusterName,
          },
        })
      } else {
        this.$router.push({
          name: this.module.value,
        })
      }
    },
    updateSidebar() {
      this.expand = false
      this.hide = true
    },
    transitionend() {
      this.mouseovered = this.$refs.sidebar.$el.style.width === '200px'
      if (this.mouseovered) this.hide = false
    },
  },
}
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
  line-height: 36px;
}
.dot {
  margin: 0 auto;
}
</style>
