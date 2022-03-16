<template>
  <v-menu
    v-model="menu"
    bottom
    left
    offset-y
    origin="top right"
    transition="scale-transition"
    nudge-bottom="15px"
    z-index="1000"
    :close-on-content-click="false"
    min-width="200px"
    max-width="310px"
  >
    <template #activator="{ on }">
      <v-btn
        dark
        icon
        class="mr-1"
        v-on="on"
        @click="expand = false"
      >
        <v-icon>fas fa-user-circle</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-list-item
        two-line
        class="py-2 primary white--text"
      >
        <v-list-item-avatar>
          <!-- <v-icon large>fas fa-user-circle</v-icon> -->
          <v-avatar
            :size="45"
            color="white"
            class="primary--text font-weight-medium"
            style="min-width: 40px; width: 40px;"
          >
            <span class="text-h5">
              {{ User.Username ? User.Username[0].toLocaleUpperCase() : 'N' }}
            </span>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="text-h6 white--text kubegems__detail">
            {{ User.Username }}
            <v-chip
              pill
              class="mr-1 primary--text"
              small
              color="white"
            >
              <v-avatar
                color="white"
                left
                class="mr-0"
              >
                <v-btn
                  class="primary--text"
                  small
                  color="white"
                >
                  <BaseLogo
                    class="primary--text logo-margin mt-1"
                    :icon-name="User.SourceVendor ? User.SourceVendor.toLowerCase() : 'kubegems'"
                    :width="20"
                    :ml="0"
                  />
                </v-btn>
              </v-avatar>
              <span class="font-weight-medium primary--text kubegems__detail">
                {{ User.Source || 'selfhosted' }}
              </span>
            </v-chip>
            <div class="kubegems__clear-float" />
          </v-list-item-title>
          <v-list-item-subtitle class="white--text">
            {{
              User && User.Email && User.Email.length === 0
                ? '暂无邮箱'
                : User.Email
            }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="mb-2" />
      <v-list class="pt-0">
        <v-list-item @click="showTenantSelect">
          <v-list-item-avatar
            height="25"
            width="25"
            min-width="25"
          >
            <v-icon color="primary">mdi-account-multiple</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-body-2 font-weight-medium kubegems__detail">
              租户
              <v-flex
                class="float-right white--text blue-grey lighten-2 px-1 rounded"
              >
                {{ Tenant().TenantName }}
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="toUserCenter">
          <v-list-item-avatar
            height="25"
            width="25"
            min-width="25"
          >
            <v-icon color="primary">mdi-account</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-body-2 font-weight-medium kubegems__detail">
              用户中心
              <v-flex
                class="float-right white--text blue-grey lighten-2 px-1 rounded"
              >
                {{ Admin ? '管理员' : '普通成员' }}
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="toBook">
          <v-list-item-avatar
            height="25"
            width="25"
            min-width="25"
          >
            <v-icon color="primary">mdi-book-open-variant</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-body-2 font-weight-medium kubegems__detail">
              产品手册
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="showAbout">
          <v-list-item-avatar
            height="25"
            width="25"
            min-width="25"
          >
            <v-icon color="primary">mdi-vimeo</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-body-2 font-weight-medium kubegems__detail">
              关于
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          color="primary"
          @click="logout"
        >
          <v-icon
            left
            small
          >
            fas fa-sign-out-alt
          </v-icon>
          <span class="font-weight-medium kubegems__detail">退出</span>
        </v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>

    <About ref="about" />
    <TenantSelect ref="tenantSelect" />
  </v-menu>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import About from './components/About'
import TenantSelect from './components/TenantSelect'
import BaseSelect from '@/mixins/select'
import BasePermission from '@/mixins/permission'

export default {
  name: 'User',
  components: {
    About,
    TenantSelect,
  },
  mixins: [BaseSelect, BasePermission],
  data() {
    return {
      menu: false,
      expand: false,
    }
  },
  computed: {
    ...mapState(['Admin', 'User', 'JWT']),
    ...mapGetters(['Tenant', 'Project']),
  },
  methods: {
    logout() {
      this.$store.commit('CLEARALL')
      this.$router.push({ name: 'login' })
    },
    showAbout() {
      this.$refs.about.init()
      this.$refs.about.open()
      this.closeUserMenu()
    },
    showTenantSelect() {
      this.$refs.tenantSelect.init()
      this.$refs.tenantSelect.open()
      this.closeUserMenu()
    },
    toBook() {
      window.open(`https://docs.${process.env.VUE_APP_DOMAIN}`)
      this.closeUserMenu()
    },
    toUserCenter() {
      this.$router.push({ name: 'user-center' })
      this.closeUserMenu()
    },
    closeUserMenu() {
      this.menu = false
      this.expand = false
    },
  },
}
</script>
