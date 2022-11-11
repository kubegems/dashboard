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
  <v-app-bar app class="header" clipped-left clipped-right color="primary" dark>
    <v-app-bar-nav-icon
      v-if="showAppBarNavIcon"
      @click="$vuetify.breakpoint.smAndDown ? setSidebarDrawer(!SidebarDrawer) : $emit('input', !value)"
    />

    <div>
      <div class="hidden-sm-and-down float-left">
        <v-img class="kubegems__absolute-middle" contain :src="logo" width="140" />
      </div>
      <div
        class="pl-2 text-h6 float-left header__line-height"
        :style="{
          fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important`,
          fontWeight: `bold`,
          fontSize: `1.1rem !important`,
          marginLeft: `140px`,
        }"
      >
        {{ $root.$t(smallTitle) }}
      </div>

      <div class="kubegems__clear-float" />
    </div>

    <v-spacer />

    <v-btn v-if="!GlobalPlugins['kubegems-models']" color="primary" dark depressed @click="toAppStore">
      <v-icon class="header__icon-line-height" left> mdi-shopping </v-icon>
      <span
        class="header__span-line-height"
        :style="{ fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important`, fontWeight: `bold` }"
      >
        {{ $root.$t('header.app_store') }}
      </span>
    </v-btn>

    <v-menu
      v-else
      v-model="storeMenu"
      bottom
      content-class="header__bg"
      left
      nudge-bottom="5px"
      offset-y
      origin="top center"
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <v-btn color="primary" dark depressed v-on="on">
          <v-icon v-if="StoreMode === 'app'" class="header__icon-line-height" left> mdi-shopping </v-icon>
          <v-icon v-else class="header__icon-line-height" left> mdi-cube </v-icon>
          <span
            class="header__span-line-height"
            :style="{ fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important;`, fontWeight: `bold` }"
          >
            {{ StoreMode === 'app' ? $root.$t('header.app_store') : $root.$t('header.model_store') }}
          </span>
          <v-icon v-if="storeMenu" right>mdi-chevron-up</v-icon>
          <v-icon v-else right>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-data-iterator hide-default-footer :items="[{ text: '', values: stores }]">
        <template #default="props">
          <v-card v-for="item in props.items" :key="item.text" flat>
            <v-list dense>
              <v-list-item
                v-for="(store, index) in item.values"
                :key="index"
                class="text-body-2 text-start font-weight-medium pl-2 mx-2"
                link
                :style="{
                  color: store.value === StoreMode ? '#1e88e5 !important' : 'rgba(0, 0, 0, 0.7) !important',
                }"
                @click="goStore(store)"
              >
                <v-list-item-content class="text-body-2 font-weight-medium">
                  <span>
                    <v-icon
                      v-if="store.value === 'app'"
                      :class="{ header__highlight: store.value === StoreMode }"
                      left
                      small
                    >
                      mdi-shopping
                    </v-icon>
                    <v-icon v-else :class="{ header__highlight: store.value === StoreMode }" left small>
                      mdi-cube
                    </v-icon>
                    {{ store.text }}
                  </span>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </template>
      </v-data-iterator>
    </v-menu>

    <v-btn color="primary" dark depressed @click="toWorkspace">
      <v-icon class="header__icon-line-height" left> mdi-home </v-icon>
      <span
        class="header__span-line-height"
        :style="{ fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important`, fontWeight: `bold` }"
      >
        {{ $root.$t('header.workspace') }}
      </span>
    </v-btn>

    <Message />
    <User />
  </v-app-bar>
</template>

<script>
  import { mapGetters, mapMutations, mapState } from 'vuex';

  import Message from './Message';
  import User from './User';
  import { LOGO_WHITE } from '@/constants/platform';
  import BasePermission from '@/mixins/permission';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'Header',
    components: {
      Message,
      User,
    },
    mixins: [BasePermission, BaseSelect],
    inject: ['reload'],
    props: {
      showAppBarNavIcon: {
        type: Boolean,
        default: true,
      },
      smallTitle: {
        type: String,
        default: '',
      },
      value: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        storeMenu: false,
        stores: [
          { text: this.$root.$t('header.app_store'), value: 'app' },
          { text: this.$root.$t('header.model_store'), value: 'model' },
        ],
        logo: LOGO_WHITE,
      };
    },
    computed: {
      ...mapState(['SidebarDrawer', 'Admin', 'User', 'JWT', 'StoreMode', 'GlobalPlugins']),
      ...mapGetters(['Tenant', 'Project']),
    },
    mounted() {
      this.$nextTick(() => {
        if (['app-store', 'model-store'].indexOf(this.$route.meta.rootName) > -1) {
          this.$store.commit('SET_STORE', this.$route.meta.rootName === 'app-store' ? 'app' : 'model');
        }
      });
    },
    methods: {
      ...mapMutations({
        setSidebarDrawer: 'SET_SIDEBAR_DRAWER',
      }),
      toAppStore() {
        this.$store.commit('CLEAR_VIRTUAL_SPACE');
        if (this.Tenant().ID > 0 || this.Admin) {
          this.$router.push({ name: 'appstore-center' });
        } else {
          this.$router.push({ name: 'whitepage' });
        }
      },
      toModelStore() {
        this.$store.commit('CLEAR_VIRTUAL_SPACE');
        if (this.Tenant().ID > 0 || this.Admin) {
          this.$router.push({ name: 'modelstore-center' });
        } else {
          this.$router.push({ name: 'whitepage' });
        }
      },
      goStore(store) {
        this.$store.commit('SET_STORE', store.value);
        if (this.StoreMode === 'app') this.toAppStore();
        else this.toModelStore();
      },
      async toWorkspace() {
        this.$store.commit('CLEAR_VIRTUAL_SPACE');
        if (this.Tenant().ID === 0) {
          await this.$store.dispatch('UPDATE_TENANT_DATA');
        }
        if (this.Tenant().ID > 0 || this.Admin) {
          this.$store.commit('SET_ADMIN_VIEWPORT', false);
          this.$store.commit('CLEAR_RESOURCE');
          this.$router.push({
            name: 'resource-dashboard',
            params: { tenant: this.Tenant().TenantName },
          });
        } else {
          this.$router.push({ name: 'whitepage' });
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .header {
    z-index: 9;

    &__line-height {
      line-height: 64px !important;
    }

    &__icon-line-height {
      line-height: 20px !important;
    }

    &__span-line-height {
      line-height: 22px !important;
    }

    &__bg {
      z-index: 9999 !important;
    }

    &__highlight {
      color: #1e88e5 !important;
    }
  }
</style>
