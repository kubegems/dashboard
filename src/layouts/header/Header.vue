<template>
  <v-app-bar app clipped-left clipped-right color="primary" dark>
    <v-app-bar-nav-icon
      v-if="showAppBarNavIcon"
      @click="$vuetify.breakpoint.smAndDown ? setSidebarDrawer(!SidebarDrawer) : $emit('input', !value)"
    />

    <div>
      <div class="hidden-sm-and-down float-left">
        <v-img src="/logo.svg" width="140" contain class="kubegems__absolute-middle" />
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

    <v-btn depressed color="primary" dark @click="toAppStore">
      <v-icon left small class="header-icon-line-height"> fas fa-shopping-bag </v-icon>
      <span
        style="font-family: Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important; font-weight: bold;"
        class="header-span-line-height"
      >
        应用商店
      </span>
    </v-btn>

    <v-btn depressed color="primary" dark @click="toWorkspace">
      <v-icon left small class="header-icon-line-height"> fas fa-th </v-icon>
      <span
        style="font-family: Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important; font-weight: bold;"
        class="header-span-line-height"
      >
        工作台
      </span>
    </v-btn>

    <Message />
    <User />
  </v-app-bar>
</template>

<script>
  import { mapState, mapMutations, mapGetters } from 'vuex';
  import Message from './Message';
  import User from './User';
  import BaseSelect from '@/mixins/select';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'Header',
    components: {
      Message,
      User,
    },
    mixins: [BaseSelect, BasePermission],
    inject: ['reload'],
    props: {
      value: {
        type: Boolean,
        default: false,
      },
      showAppBarNavIcon: {
        type: Boolean,
        default: true,
      },
      smallTitle: {
        type: String,
        default: '',
      },
    },
    computed: {
      ...mapState(['SidebarDrawer', 'Admin', 'User', 'JWT', 'Store']),
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
