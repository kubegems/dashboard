<template>
  <v-app-bar app clipped-left clipped-right color="primary" dark>
    <v-app-bar-nav-icon
      v-if="showAppBarNavIcon"
      @click="$vuetify.breakpoint.smAndDown ? setSidebarDrawer(!SidebarDrawer) : $emit('input', !value)"
    />

    <div>
      <div class="hidden-sm-and-down float-left">
        <v-img class="kubegems__absolute-middle" contain src="/logo.svg" width="140" />
      </div>
      <div
        class="pl-2 text-h6 float-left header-line-height"
        style="
          font-family: Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important;
          font-weight: bold;
          font-size: 1.1rem !important;
          margin-left: 140px;
        "
      >
        {{ smallTitle }}
      </div>

      <div class="kubegems__clear-float" />
    </div>

    <v-spacer />

    <v-btn v-if="Plugins.ModelX" color="primary" dark depressed @click="toAppStore">
      <v-icon class="header-icon-line-height" left small> fas fa-shopping-bag </v-icon>
      <span
        class="header-span-line-height"
        style="font-family: Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important; font-weight: bold"
      >
        应用商店
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
          <v-icon v-if="StoreMode === 'app'" class="header-icon-line-height" left small> fas fa-shopping-bag </v-icon>
          <v-icon v-else class="header-icon-line-height" left small> fas fa-boxes </v-icon>
          <span
            class="header-span-line-height"
            style="font-family: Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important; font-weight: bold"
          >
            {{ StoreMode === 'app' ? '应用商店' : '模型商店' }}
          </span>
          <v-icon v-if="storeMenu" right>fas fa-angle-up</v-icon>
          <v-icon v-else right>fas fa-angle-down</v-icon>
        </v-btn>
      </template>
      <v-data-iterator hide-default-footer :items="[{ text: '', values: stores }]">
        <template #default="props">
          <v-card v-for="item in props.items" :key="item.text">
            <v-list dense>
              <v-list-item
                v-for="(store, index) in item.values"
                :key="index"
                class="text-body-2 text-center font-weight-medium"
                link
                :style="
                  store.value === StoreMode ? `color: #1e88e5 !important;` : `color: rgba(0, 0, 0, 0.7) !important;`
                "
                @click="goStore(store)"
              >
                <v-list-item-content class="text-body-2 font-weight-medium">
                  <span>
                    <v-icon
                      v-if="store.value === 'app'"
                      :class="store.value === StoreMode ? 'header--highlight' : ''"
                      left
                      small
                    >
                      fas fa-shopping-bag
                    </v-icon>
                    <v-icon v-else :class="store.value === StoreMode ? 'header--highlight' : ''" left small>
                      fas fa-boxes
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
      <v-icon class="header-icon-line-height" left small> fas fa-th </v-icon>
      <span
        class="header-span-line-height"
        style="font-family: Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important; font-weight: bold"
      >
        工作台
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
    data: () => ({
      storeMenu: false,
      stores: [
        { text: '应用商店', value: 'app' },
        { text: '模型商店', value: 'model' },
      ],
    }),
    computed: {
      ...mapState(['SidebarDrawer', 'Admin', 'User', 'JWT', 'StoreMode', 'Plugins']),
      ...mapGetters(['Tenant', 'Project']),
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
      toWorkspace() {
        this.$store.commit('CLEAR_VIRTUAL_SPACE');
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
  .header-line-height {
    line-height: 64px !important;
  }
  .header-icon-line-height {
    line-height: 20px !important;
  }
  .header-span-line-height {
    line-height: 22px !important;
  }

  .header__bg {
    z-index: 9999 !important;
  }

  .header--highlight {
    color: #1e88e5 !important;
  }
</style>
