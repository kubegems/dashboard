<template>
  <v-app id="inspire">
    <Header
      v-model="expandOnHover"
      :small-title="AdminViewport ? '管理员' : '租户工作台'"
    />
    <v-main :style="`min-height: ${height}px;`">
      <BasePluginPass>
        <template #default>
          <router-view />
        </template>
      </BasePluginPass>
      <Tool v-if="Admin" />

      <Sidebar
        :key="SidebarKey"
        :expand-on-hover.sync="expandOnHover"
      />
    </v-main>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
import Header from './header/Header'
import Sidebar from './sidebar/Sidebar'
import Tool from './tool/Tool'

export default {
  name: 'Layout',
  components: {
    Header,
    Sidebar,
    Tool,
  },
  data: () => ({
    expandOnHover: false,
  }),
  computed: {
    ...mapState(['Admin', 'AdminViewport', 'SidebarKey', 'Scale']),
    height() {
      return window.innerHeight / this.Scale
    },
  },
}
</script>
