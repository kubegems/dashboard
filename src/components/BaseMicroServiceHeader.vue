<template>
  <v-card class="rounded-tr-0 rounded-tl-0 mb-3" flat height="60">
    <v-card-title class="py-3 mt-n3" :style="{ height: `60px` }">
      <v-sheet v-if="selectable" class="text-subtitle-1">
        虚拟空间
        <v-menu
          v-model="virtualSpaceMenu"
          bottom
          content-class="micro-service-header__bg"
          left
          max-height="300px"
          max-width="220px"
          min-width="120px"
          nudge-bottom="5px"
          offset-y
          origin="top center"
          transition="scale-transition"
        >
          <template #activator="{ on }">
            <v-btn
              class="primary--text text-subtitle-1 font-weight-medium mt-n1"
              color="white"
              dark
              depressed
              small
              v-on="on"
              @click.stop="getVirtualspace"
            >
              <v-icon left>fas fa-hospital-alt</v-icon>
              {{ VirtualSpace().VirtualSpaceName }}
              <v-icon v-if="virtualSpaceMenu" right>fas fa-angle-up</v-icon>
              <v-icon v-else right>fas fa-angle-down</v-icon>
            </v-btn>
          </template>
          <v-data-iterator hide-default-footer :items="[{ text: '虚拟空间', values: m_select_virtualSpaceItems }]">
            <template #no-data>
              <v-card>
                <v-card-text> 暂无虚拟空间 </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text" flat :loading="loading">
                <v-list class="pb-3" dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>虚拟空间</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <div class="header__list px-2">
                    <v-list-item
                      v-for="(virtualspace, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center font-weight-medium px-2"
                      link
                      :style="virtualspace.text === VirtualSpace().VirtualSpaceName ? `color: #1e88e5 !important;` : ``"
                      @click="setVirtualSpace(virtualspace)"
                    >
                      <v-list-item-content class="text-body-2 font-weight-medium text-start">
                        <div class="kubegems__break-all">
                          <v-icon color="primary" left small>fas fa-hospital-alt</v-icon>
                          {{ virtualspace.text }}
                        </div>
                      </v-list-item-content>
                    </v-list-item>
                  </div>
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
            <v-icon color="primary" right small>fas fa-hospital-alt</v-icon>
            {{ VirtualSpace().VirtualSpaceName }}
          </span>
        </v-sheet>
        <v-sheet class="text-subtitle-1 ml-4">
          集群
          <span class="text-subtitle-1 ml-2 primary--text font-weight-medium">
            <v-icon color="primary" right small>fab fa-docker</v-icon>
            {{ $route.query.cluster }}
          </span>
        </v-sheet>
        <v-sheet class="text-subtitle-1 ml-4">
          环境
          <span class="text-subtitle-1 ml-2 primary--text font-weight-medium">
            <v-icon color="primary" right small>fas fa-cloud</v-icon>
            {{ $route.query.environment }}
          </span>
        </v-sheet>
      </template>

      <v-spacer />

      <v-sheet>
        <span class="text-body-2 kubegems__text">
          虚拟空间角色:
          {{
            $VIRTUALSPACE_ROLE[m_permisson_virtualSpaceRole] ? $VIRTUALSPACE_ROLE[m_permisson_virtualSpaceRole] : '暂无'
          }}
        </span>
        <v-btn class="primary--text" small text @click="returnVirtualSpace">
          <v-icon left small>mdi-logout</v-icon>
          返回
        </v-btn>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex';

  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'BaseMicroServiceHeader',
    mixins: [BasePermission, BaseResource, BaseSelect],
    inject: ['reload'],
    props: {
      selectable: {
        type: Boolean,
        default: () => true,
      },
    },
    data: () => ({
      virtualSpaceMenu: false,
      loading: false,
    }),
    computed: {
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      async setVirtualSpace(item) {
        this.$store.commit('SET_NAMESPACE_FILTER', null);
        this.$store.commit('SET_ENVIRONMENT_FILTER', null);
        await this.$store.dispatch('UPDATE_VIRTUALSPACE_DATA');
        await this.$router.replace({
          params: { virtualspace: item.text },
        });
        this.reload();
      },
      returnVirtualSpace() {
        this.$store.commit('CLEAR_VIRTUAL_SPACE');
        this.$store.commit('SET_NAMESPACE_FILTER', null);
        this.$store.commit('SET_ENVIRONMENT_FILTER', null);
        this.$router.push({
          name: 'virtualspace-list',
        });
      },
      async getVirtualspace() {
        this.loading = true;
        await this.m_select_virtualSpaceSelectData();
        this.loading = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .micro-service-header__bg {
    z-index: auto !important;
  }

  .header__list {
    max-height: 250px;
    overflow-y: auto;
  }
</style>
