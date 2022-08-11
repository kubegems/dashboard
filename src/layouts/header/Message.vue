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
  <div>
    <v-menu
      v-model="menu"
      bottom
      :close-on-content-click="false"
      left
      max-width="200px"
      min-width="300px"
      nudge-bottom="15px"
      offset-y
      origin="top right"
      transition="scale-transition"
      z-index="1000"
    >
      <template #activator="{ on }">
        <v-btn dark icon v-on="on">
          <template v-if="messagesTotal > 0 || approves.length > 0">
            <v-badge color="red" dot>
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </template>
          <template v-else>
            <v-icon>mdi-bell</v-icon>
          </template>
        </v-btn>
      </template>

      <v-card>
        <v-card-text class="pa-2">
          <v-tabs v-model="tab" class="v-tabs--default" fixed-tabs height="45">
            <v-tab v-for="(item, index) in tabItems" :key="item.value">
              <v-badge
                class="mt-2"
                color="success"
                :content="index === 0 ? messagesTotal : approves.length"
                :value="index === 0 ? messagesTotal > 0 : approves.length > 0"
              >
                {{ item.text }}
              </v-badge>
            </v-tab>
          </v-tabs>

          <v-flex v-scroll.self="scrollMessage" class="message__tab-item-height">
            <v-flex
              v-if="tabItems[tab].value === 'message' ? messagesTotal === 0 : approves.length === 0"
              class="text-body-2 pa-2 text-center mt-2"
            >
              {{ tabItems[tab].value === 'message' ? $t('message.no_message') : $t('message.no_approval') }}
            </v-flex>
            <v-flex v-else class="px-4 mt-2 message__operator-title">
              <span class="text-body-2">
                {{
                  tabItems[tab].value === 'message'
                    ? `${$t('message.unread_c', [$t('message.message')])}`
                    : `${$t('message.unread_c', [$t('message.message')])}`
                }}
              </span>
              <v-flex v-if="tabItems[tab].value === 'message'" class="float-right">
                <v-btn color="warning" small text @click="readAllMessage"> {{ $t('message.clear') }} </v-btn>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-flex>
            <v-list>
              <v-list-item
                v-for="(data, index) in tabItems[tab].value === 'message' ? messages : approves"
                :key="index"
                link
                @click="setRead(data)"
              >
                <v-list-item-title>
                  <div class="d-flex align-center py-3">
                    <div class="mr-3">
                      <v-avatar color="success" size="45">
                        <span class="white--text text-h6">
                          {{
                            tabItems[tab].value === 'message'
                              ? data.MessageType === 'message'
                                ? data.Content.From[0].toLocaleUpperCase()
                                : data.MessageType[0].toLocaleUpperCase()
                              : data.ResourceType[0].toLocaleUpperCase()
                          }}
                        </span>
                      </v-avatar>
                    </div>
                    <div>
                      <h4 class="font-weight-medium kubegems__text mb-2" :style="getStatusColor(data)">
                        {{
                          tabItems[tab].value === 'message'
                            ? data.MessageType === 'message'
                              ? data.Content.From
                              : data.MessageType
                            : data.ResourceType
                        }}
                      </h4>
                      <span
                        :class="`text--secondary text-body-2 descpart d-block text-truncate ${messageClass[index]}`"
                        :style="getStatusColor(data)"
                        @mouseout="$set(messageClass, index, '')"
                        @mouseover="$set(messageClass, index, 'message__content-overflow')"
                      >
                        {{ data.Title }}
                        <span v-if="tabItems[tab].value === 'approve'">
                          {{ $t('resource.cpu') }} : {{ data.Content['limits.cpu'] }}, {{ $t('resource.memory') }} :
                          {{ data.Content['limits.memory'] }}, {{ $t('resource.storage') }} :
                          {{ data.Content['requests.storage'] }}
                        </span>
                      </span>
                      <small class="text--secondary" :style="getStatusColor(data)">
                        {{ $moment(data.CreatedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() }}
                      </small>
                    </div>
                  </div>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-flex>
        </v-card-text>
      </v-card>
    </v-menu>

    <ApproveResource ref="approveResource" @refresh="approveList" />
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ApproveResource from './components/ApproveResource';
  import messages from './i18n';
  import { getApproveList, getLoginUserAuth, getMessageList, putReadMessage } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'Message',
    i18n: {
      messages: messages,
    },
    components: {
      ApproveResource,
    },
    mixins: [BaseSelect],
    inject: ['reload'],
    data() {
      return {
        menu: false,
        messages: [],
        messagesTotal: 0,
        messagesPage: 1,
        approves: [],
        tab: 0,
        messageClass: [],
        alertTimeout: null,
        messageTimeout: null,
      };
    },
    computed: {
      ...mapState(['JWT', 'MessageStreamWS', 'User', 'Admin', 'Auth', 'Locale']),
      ...mapGetters(['Project', 'Environment', 'Tenant']),
      tabItems() {
        return [
          { text: this.$t('message.message'), value: 'message' },
          { text: this.$t('message.approval'), value: 'approve' },
        ];
      },
    },
    watch: {
      '$store.state.MessageStream': {
        handler: async function (updatingMessage) {
          if (!updatingMessage) return;
          const message = JSON.parse(updatingMessage);
          if (
            message.MessageType !== 'message' &&
            message.MessageType !== 'approve' &&
            message.MessageType !== 'alert'
          ) {
            return;
          }
          if (message.MessageType === 'message') {
            this.messageList();
            this.refreshUserAuth();
            this.$store.dispatch('UPDATE_TENANT_DATA');
            if (this.Tenant().ID > 0) {
              this.$store.dispatch('UPDATE_PROJECT_DATA', this.Tenant().ID);
            }
            if (this.Project().ID > 0) {
              this.$store.dispatch('UPDATE_ENVIRONMENT_DATA', this.Project().ID);
            }
            if (message.Content.AffectedUsers && message.Content.AffectedUsers.indexOf(this.User.ID) > -1) {
              this.$store.commit('SET_SNACKBAR', {
                text: `${message.Content.Detail}`,
                color: 'success',
              });
              if (this.Admin) return;
              if (message.EventKind === 'delete') {
                this.$store.commit('SET_ADMIN_VIEWPORT', false);
                this.$store.commit('CLEAR_RESOURCE');
                if (message.Content.ResourceType === 'tenant') {
                  if (this.Tenant().ID === message.Content.ResourceID) {
                    this.$store.commit('CLEAR_TENANT');
                    this.$router.push({ name: 'tenant-page' });
                  }
                } else if (message.Content.ResourceType === 'project') {
                  if (this.Project().ID === message.Content.ResourceID) {
                    this.$router.push({
                      name: 'resource-dashboard',
                      params: { tenant: this.Tenant().TenantName },
                    });
                  }
                } else if (message.Content.ResourceType === 'environment') {
                  if (this.Environment().ID === message.Content.ResourceID) {
                    this.$router.push({
                      name: 'resource-dashboard',
                      params: { tenant: this.Tenant().TenantName },
                    });
                  }
                } else if (message.Content.ResourceType === 'cluster') {
                  this.$store.commit('CLEAR_CLUSTER');
                  this.$router.push({
                    name: 'resource-dashboard',
                    params: { tenant: this.Tenant().TenantName },
                  });
                } else if (message.Content.ResourceType === 'application') {
                  if (this.$route.path.indexOf('apps') > -1) {
                    this.$router.push({
                      name: 'app-list',
                      params: this.$route.params,
                      query: this.$route.query,
                    });
                  }
                }
              } else if (message.EventKind === 'update') {
                if (['tenant', 'project', 'environment'].indexOf(message.Content.ResourceType) > -1) {
                  this.$router.push({
                    name: 'resource-dashboard',
                    params: { tenant: this.Tenant().TenantName },
                  });
                }
              }
            }
          } else if (message.MessageType === 'approve') {
            this.$store.commit('SET_SNACKBAR', {
              text: `${message.Content.Detail}`,
              color: 'success',
            });
            this.approveList();
          } else if (message.MessageType === 'alert') {
            this.$store.commit('SET_SNACKBAR', {
              text: `${message.Content.Detail}`,
              color: 'warning',
            });
            if (!this.alertTimeout) {
              this.messageList();
              this.alertTimeout = setTimeout(() => {
                clearTimeout(this.alertTimeout);
                this.alertTimeout = null;
              }, 1000);
            }
          }
        },
        deep: true,
      },
    },
    destroyed() {
      if (this.alertTimeout) clearTimeout(this.alertTimeout);
      if (this.messageTimeout) clearTimeout(this.messageTimeout);
    },
    mounted() {
      if (this.JWT) {
        this.messageList();
        this.approveList();
      }
    },
    methods: {
      async messageList(append = false) {
        const data = await getMessageList({
          noprocessing: true,
          page: append ? (this.messagesPage += 1) : 1,
          is_read: false,
        });
        if (append) {
          this.messages = this.messages.concat(data.List);
        } else {
          this.messages = data.List;
        }
        this.messagesTotal = data.Total;
        this.messagesPage = data.CurrentPage;
        this.messages.forEach(() => {
          this.messageClass.push('');
        });
      },
      async approveList() {
        const data = await getApproveList({ noprocessing: true });
        this.approves = data;
      },
      async refreshUserAuth() {
        const data = await getLoginUserAuth();
        this.$store.commit('SET_USER_AUTH', data);
        this.$store.commit('SET_ADMIN', data.systemRole === 'sysadmin');
      },
      async setRead(data) {
        if (this.tabItems[this.tab].value === 'message') {
          await this.setMessageRead(data);
        } else {
          if (data.Status === 'pending') {
            await this.toScaleResource(data);
          }
        }
      },
      async setMessageRead(message) {
        // message详情覆盖旧的message值
        message = await putReadMessage(message.ID, {
          message_type: message.MessageType,
        });
        this.messageList();
        if (message.MessageType === 'alert') {
          const admin = message.Content.EnvironmentID === 0;
          this.$store.commit('SET_ADMIN_VIEWPORT', admin);
          const params = admin
            ? {
                name: message.Content.AlertName,
              }
            : {
                name: message.Content.AlertName,
                tenant: message.Content.TenantName,
                project: message.Content.ProjectName,
                environment: message.Content.EnvironmentName,
              };
          this.$router.push({
            name:
              message?.Content?.From === 'monitor'
                ? `${admin ? 'admin-' : ''}prometheusrule-detail`
                : `${admin ? 'admin-' : ''}log-alert-detail`,
            params: params,
            query: {
              namespace: message.Content.Namespace,
              createAt: message.CreatedAt,
              cluster: message.Content.ClusterName,
            },
          });
          this.menu = false;
        }
      },
      async toScaleResource(approve) {
        this.$refs.approveResource.init(approve);
        this.$refs.approveResource.open();
      },
      async readAllMessage() {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('message.clear'),
          content: { text: this.$t('message.clear'), type: 'confirm' },
          param: {},
          doFunc: async () => {
            await putReadMessage('_all', { message_type: '' });
            this.messageList();
          },
        });
      },
      getStatusColor(data) {
        return this.tabItems[this.tab].value === 'approve'
          ? data.Status === 'pending'
            ? 'color: #1e88e5 !important;'
            : ''
          : !data.IsRead
          ? 'color: #1e88e5 !important;'
          : '';
      },
      async scrollMessage(e) {
        if (this.tab === 1 || this.messageTimeout) return;
        if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight) {
          this.messageTimeout = setTimeout(async () => {
            await this.messageList(true);
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
          }, 100);
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .message {
    &__content-overflow {
      white-space: initial !important;
      word-break: break-word !important;
    }

    &__tab-item-height {
      max-height: 450px;
      overflow-y: auto;
    }

    &__operator-title {
      line-height: 28px;
    }
  }
</style>
