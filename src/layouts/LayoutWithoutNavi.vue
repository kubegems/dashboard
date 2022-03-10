<template>
  <v-app id="inspire">
    <Header
      v-model="expandOnHover"
      :show-app-bar-nav-icon="false"
      :small-title="$route.meta.smallTitle"
    />
    <v-main :style="`min-height: ${height}px;`">
      <!-- <BasePluginPass>
        <template #default> -->
      <router-view />
      <!-- </template>
      </BasePluginPass> -->
      <Tool v-if="Admin" />
    </v-main>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
import Header from './header/Header'
import Tool from './tool/Tool'

export default {
  name: 'LayoutWithoutNavi',
  components: {
    Header,
    Tool,
  },
  data: () => ({
    expandOnHover: false,
  }),
  computed: {
    ...mapState(['Admin', 'Scale']),
    height() {
      return window.innerHeight / this.Scale
    },
  },
}
</script>
