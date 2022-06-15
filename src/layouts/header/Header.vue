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

    <v-btn color="primary" dark depressed @click="toAppStore">
      <v-icon class="header-icon-line-height" left small> fas fa-shopping-bag </v-icon>
      <span
        class="header-span-line-height"
        style="font-family: Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important; font-weight: bold"
      >
        应用商店
      </span>
    </v-btn>

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
  import { mapState, mapMutations, mapGetters } from 'vuex';

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
