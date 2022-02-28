<template>
  <v-card class="rounded-tr-0 rounded-tl-0 mb-3" height="60">
    <v-card-title class="py-3 mt-n3" style="height: 60px;">
      <v-sheet v-if="selectable" class="text-subtitle-1">
        虚拟空间
        <v-menu
          v-model="virtualSpaceMenu"
          bottom
          left
          offset-y
          origin="top center"
          transition="scale-transition"
          nudge-bottom="5px"
          content-class="z-index-bg"
        >
          <template #activator="{ on }">
            <v-btn
              depressed
              color="white"
              class="primary--text text-subtitle-1 font-weight-medium mt-n1"
              small
              dark
              v-on="on"
              @click="virtualSpaceSelectData"
            >
              <v-icon left>fas fa-cloud</v-icon>
              {{ VirtualSpace().VirtualSpaceName }}
              <v-icon v-if="virtualSpaceMenu" right>fas fa-angle-up</v-icon>
              <v-icon v-else right>fas fa-angle-down</v-icon>
            </v-btn>
          </template>
          <v-data-iterator
            :items="[{ text: '虚拟空间', values: virtualSpaceSelect }]"
            hide-default-footer
          >
            <template #no-data>
              <v-card>
                <v-card-text> 暂无虚拟空间 </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text">
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>虚拟空间</span>
                  </v-flex>
                  <v-divider class="mx-2"></v-divider>
                  <v-list-item
                    v-for="(virtualspace, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center font-weight-medium"
                    link
                    :style="
                      virtualspace.text === VirtualSpace().VirtualSpaceName
                        ? `color: #1e88e5 !important;`
                        : ``
                    "
                    @click="setVirtualSpace(virtualspace)"
                  >
                    <v-list-item-content class="text-body-2 font-weight-medium">
                      <span>{{ virtualspace.text }}</span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
      <template v-else>
        <v-sheet class="text-subtitle-1">
          虚拟空间
          <span class="text-subtitle-1 ml-2 primary--text font-weight-medium">
            {{ VirtualSpace().VirtualSpaceName }}
          </span>
        </v-sheet>
        <v-sheet class="text-subtitle-1 ml-4">
          集群
          <span class="text-subtitle-1 ml-2 primary--text font-weight-medium">
            {{ $route.query.cluster }}
          </span>
        </v-sheet>
        <v-sheet class="text-subtitle-1 ml-4">
          环境
          <span class="text-subtitle-1 ml-2 primary--text font-weight-medium">
            {{ $route.query.environment }}
          </span>
        </v-sheet>
      </template>

      <v-spacer />

      <v-sheet>
        <span class="text-body-2 kubegems__role">
          虚拟空间角色:
          {{
            virtualSpaceRoleCN[virtualSpaceRole]
              ? virtualSpaceRoleCN[virtualSpaceRole]
              : '暂无'
          }}
        </span>
        <v-btn text small class="primary--text" @click="returnVirtualSpace">
          <v-icon left small>mdi-logout</v-icon>
          返回
        </v-btn>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script>
import BaseSelect from '@/mixins/select'
import { mapGetters } from 'vuex'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'

export default {
  name: 'BaseMicroServiceHeader',
  mixins: [BaseSelect, BaseResource, BasePermission],
  inject: ['reload'],
  props: {
    selectable: {
      type: Boolean,
      default: () => true,
    },
  },
  data: () => ({
    virtualSpaceMenu: false,
  }),
  computed: {
    ...mapGetters(['VirtualSpace']),
  },
  methods: {
    async setVirtualSpace(item) {
      this.$store.commit('SET_NAMESPACE_FILTER', null)
      this.$store.commit('SET_ENVIRONMENT_FILTER', null)
      await this.$store.dispatch('UPDATE_VIRTUALSPACE_DATA')
      this.$router.replace({
        params: { virtualspace: item.text },
      })
      window.setTimeout(() => {
        this.reload()
      }, 800)
    },
    returnVirtualSpace() {
      this.$store.commit('CLEAR_VIRTUAL_SPACE')
      this.$store.commit('SET_NAMESPACE_FILTER', null)
      this.$store.commit('SET_ENVIRONMENT_FILTER', null)
      this.$router.push({
        name: 'virtualspace-list',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.z-index-bg {
  z-index: auto !important;
}
</style>
