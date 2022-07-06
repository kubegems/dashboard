<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <v-row class="mt-0">
      <v-col class="pt-0" cols="3">
        <v-card>
          <v-card-text class="pa-7">
            <div class="d-flex justify-center my-3">
              <div class="text-center">
                <Icon height="120px" icon="carbon:user-filled" :style="{ color: `#1e88e5` }" width="120px" />
                <h3 class="mt-2 text-h6 font-weight-regular">
                  {{ User.Username }}
                  <v-chip class="mr-1 mt-n1" pill small>
                    <v-avatar left>
                      <v-btn class="white--text" color="grey lighten-4" small>
                        <BaseLogo
                          class="primary--text logo-margin mt-1"
                          :icon-name="User.SourceVendor ? User.SourceVendor.toLocaleLowerCase() : 'kubegems'"
                          :ml="0"
                          :width="20"
                        />
                      </v-btn>
                    </v-avatar>
                    <span class="font-weight-medium kubegems__text">
                      {{ $VENDOR[User.SourceVendor] || 'Selfhosted' }}
                    </span>
                  </v-chip>
                </h3>
                <h5 class="text-subtitle-2 mt-1">
                  {{ Admin ? '管理员' : '普通用户' }}
                </h5>
              </div>
            </div>
            <v-divider />
            <div class="py-5">
              <h5 class="text-subtitle-1 kubegems__text">邮箱</h5>
              <h6 class="text-body-2 mb-3">
                {{ User && User.Email && User.Email.length === 0 ? '暂无邮箱' : User.Email }}
              </h6>
              <h5 class="text-subtitle-1 kubegems__text">手机号</h5>
              <h6 class="text-body-2 mb-3">
                {{ User.Phone ? User.Phone : '暂无' }}
              </h6>
              <h5 class="text-subtitle-1 kubegems__text">注册时间</h5>
              <h6 class="text-body-2 mb-3">
                {{ User.CreatedAt ? $moment(User.CreatedAt).format('lll') : '' }}
              </h6>
              <h5 class="text-subtitle-1 kubegems__text">上次登录</h5>
              <h6 class="text-body-2 mb-3">
                {{ User.LastLoginAt ? $moment(User.LastLoginAt).format('lll') : '' }}
              </h6>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="pt-0" cols="9">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AuditList from './components/AuditList';
  import MessageBox from './components/MessageBox';
  import OwnerSetting from './components/OwnerSetting';
  import { getLoginUserInfo } from '@/api';

  export default {
    name: 'UserCenter',
    components: {
      AuditList,
      MessageBox,
      OwnerSetting,
    },
    data: () => ({
      tab: 0,
      tabItems: [
        { text: '消息盒子', value: 'MessageBox' },
        { text: '操作历史', value: 'AuditList' },
        { text: '个人设置', value: 'OwnerSetting' },
      ],
    }),
    computed: {
      ...mapState(['JWT', 'User', 'Admin']),
    },
    mounted() {
      if (this.JWT) {
        this.loginUserInfo();
      }
    },
    methods: {
      async loginUserInfo() {
        const data = await getLoginUserInfo();
        if (data) {
          this.$store.commit('SET_USER', data);
        }
      },
    },
  };
</script>
