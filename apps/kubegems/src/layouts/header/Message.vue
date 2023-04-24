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
      v-model="state.menu"
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
          <template v-if="state.messagesTotal > 0 || approveItems.length > 0">
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
          <v-tabs v-model="state.tab" class="v-tabs--default" fixed-tabs height="45">
            <v-tab v-for="(item, index) in tabItems" :key="item.value">
              <v-badge
                class="mt-2"
                color="success"
                :content="index === 0 ? state.messagesTotal : approveItems.length"
                :value="index === 0 ? state.messagesTotal > 0 : approveItems.length > 0"
              >
                {{ item.text }}
              </v-badge>
            </v-tab>
          </v-tabs>

          <v-flex v-scroll.self="scrollMessage" class="message__tab-item-height">
            <v-flex
              v-if="tabItems[state.tab].value === 'message' ? state.messagesTotal === 0 : approveItems.length === 0"
              class="text-body-2 pa-2 text-center mt-2"
            >
              {{
                tabItems[state.tab].value === 'message'
                  ? i18nLocal.t('message.no_message')
                  : i18nLocal.t('message.no_approval')
              }}
            </v-flex>
            <v-flex v-else class="px-4 mt-2 message__operator-title">
              <span class="text-body-2">
                {{
                  tabItems[state.tab].value === 'message'
                    ? `${i18nLocal.t('message.unread_c', [i18nLocal.t('message.message')])}`
                    : `${i18nLocal.t('message.unread_c', [i18nLocal.t('message.message')])}`
                }}
              </span>
              <v-flex v-if="tabItems[state.tab].value === 'message'" class="float-right">
                <v-btn color="warning" small text @click="readAllMessage"> {{ i18nLocal.t('message.clear') }} </v-btn>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-flex>
            <v-list>
              <v-list-item
                v-for="(data, index) in tabItems[state.tab].value === 'message' ? messageItems : approveItems"
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
                            tabItems[state.tab].value === 'message'
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
                          tabItems[state.tab].value === 'message'
                            ? data.MessageType === 'message'
                              ? data.Content.From
                              : data.MessageType
                            : data.ResourceType
                        }}
                      </h4>
                      <span
                        :class="`text--secondary text-body-2 descpart d-block text-truncate ${messageClassItems[index]}`"
                        :style="getStatusColor(data)"
                        @mouseout="$set(messageClassItems, index, '')"
                        @mouseover="$set(messageClassItems, index, 'message__content-overflow')"
                      >
                        {{ data.Title }}
                        <span v-if="tabItems[state.tab].value === 'approve'">
                          {{ i18n.t('resource.cpu') }} : {{ data.Content['limits.cpu'] }},
                          {{ i18n.t('resource.memory') }} : {{ data.Content['limits.memory'] }},
                          {{ i18n.t('resource.storage') }} :
                          {{ data.Content['limits.storage'] }}
                        </span>
                      </span>
                      <small class="text--secondary" :style="getStatusColor(data)">
                        {{ moment(data.CreatedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() }}
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

    <ApproveResource ref="approve" @refresh="getApproveList" />
  </div>
</template>

<script lang="ts" setup>
  import { Auth } from '@kubegems/api/typed/auth';
  import { Approve, Message } from '@kubegems/api/typed/message';
  import { convertResponse2Pagination } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRoute, useRouter } from '@kubegems/extension/proxy';
  import { useParams, useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import moment from 'moment';
  import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';

  import ApproveResource from './components/ApproveResource.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const params = useParams();
  const query = useQuery();

  const tabItems = [
    { text: i18nLocal.t('message.message'), value: 'message' },
    { text: i18nLocal.t('message.approval'), value: 'approve' },
  ];

  const state = reactive({
    menu: false,
    messagesTotal: 0,
    messagesPage: 1,
    tab: 0,
    alertTimeout: null,
    messageTimeout: null,
  });

  const messageItems = ref<Message[]>([]);
  const messageClassItems = ref<string[]>([]);
  const getMessageList = async (append = false): Promise<void> => {
    const data = await new Message().getMessageList({
      noprocessing: true,
      page: append ? (state.messagesPage += 1) : 1,
      is_read: false,
      size: 10,
    });
    const pagination = convertResponse2Pagination<Message>(data);
    if (append) {
      messageItems.value = messageItems.value.concat(pagination.items);
    } else {
      messageItems.value = pagination.items;
    }
    state.messagesTotal = pagination.total;
    state.messagesPage = pagination.page;
    messageItems.value.forEach(() => {
      messageClassItems.value.push('');
    });
  };

  const approveItems = ref<Approve[]>([]);
  const getApproveList = async (): Promise<void> => {
    const data = await new Approve().getApproveList({ noprocessing: true });
    approveItems.value = data;
  };

  const refreshUserAuth = async (): Promise<void> => {
    const data = await new Auth().getLoginAuth();
    store.commit('SET_USER_AUTH', data);
    store.commit('SET_ADMIN', data.systemRole === 'sysadmin');
  };

  const setRead = async (data): Promise<void> => {
    if (tabItems[state.tab].value === 'message') {
      await setMessageRead(data);
    } else {
      if (data.Status === 'pending') {
        await toScaleResource(data);
      }
    }
  };

  const setMessageRead = async (message: Message): Promise<void> => {
    // message详情覆盖旧的message值
    message = await new Message({ ID: message.ID }).readMessage({ message_type: message.MessageType });
    getMessageList();
    if (message.MessageType === 'alert') {
      const admin = message.Content.EnvironmentID === 0;
      store.commit('SET_ADMIN_VIEWPORT', admin);
      store.commit('SET_EDGE', '');
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
      router.push({
        name:
          message?.Content?.From === 'monitor'
            ? `${admin ? 'admin-' : ''}prometheusrule-detail`
            : `${admin ? 'admin-' : ''}log-alert-detail`,
        params: params,
        query: {
          namespace: message.Content.Namespace,
          createAt: message.CreatedAt.toString(),
          cluster: message.Content.ClusterName,
        },
      });
      state.menu = false;
    }
  };

  const approve = ref(null);
  const toScaleResource = (item: Approve): void => {
    approve.value.init(item);
    approve.value.open();
  };

  const readAllMessage = (): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('message.clear'),
      content: { text: i18nLocal.t('message.clear'), type: 'confirm' },
      param: {},
      doFunc: async () => {
        await new Message({ ID: '_all' }).readMessage({ message_type: '' });
        getMessageList();
      },
    });
  };

  const getStatusColor = (data: Approve | Message): string => {
    return tabItems[state.tab].value === 'approve'
      ? data.Status === 'pending'
        ? 'color: var(--primary-color) !important;'
        : ''
      : !data.IsRead
      ? 'color: var(--primary-color) !important;'
      : '';
  };

  const scrollMessage = (e) => {
    if (state.tab === 1 || state.messageTimeout) return;
    if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight) {
      state.messageTimeout = setTimeout(async () => {
        await getMessageList(true);
        clearTimeout(state.messageTimeout);
        state.messageTimeout = null;
      }, 100);
    }
  };

  onUnmounted(() => {
    if (state.alertTimeout) clearTimeout(state.alertTimeout);
    if (state.messageTimeout) clearTimeout(state.messageTimeout);
  });

  onMounted(() => {
    getMessageList();
    getApproveList();
  });

  watch(
    () => store.state.MessageStream,
    async (updatingMessage) => {
      if (!updatingMessage) return;
      const message = JSON.parse(updatingMessage);
      if (message.MessageType !== 'message' && message.MessageType !== 'approve' && message.MessageType !== 'alert') {
        return;
      }
      if (message.MessageType === 'message') {
        getMessageList();
        refreshUserAuth();
        store.dispatch('UPDATE_TENANT_DATA');
        if (store.getters.Tenant().ID > 0) {
          store.dispatch('UPDATE_PROJECT_DATA', store.getters.Tenant().ID);
        }
        if (store.getters.Project().ID > 0) {
          store.dispatch('UPDATE_ENVIRONMENT_DATA', store.getters.Project().ID);
        }
        if (message.Content.AffectedUsers && message.Content.AffectedUsers.indexOf(store.state.User.ID) > -1) {
          store.commit('SET_SNACKBAR', {
            text: `${message.Content.Detail}`,
            color: 'success',
          });
          if (store.state.Admin) return;
          if (message.EventKind === 'delete') {
            store.commit('SET_ADMIN_VIEWPORT', false);
            store.commit('CLEAR_RESOURCE');
            if (message.Content.ResourceType === 'tenant') {
              if (store.getters.Tenant().ID === message.Content.ResourceID) {
                store.commit('SET_EDGE', '');
                store.commit('CLEAR_TENANT');
                router.push({ name: 'tenant-page' });
              }
            } else if (message.Content.ResourceType === 'project') {
              if (store.getters.Project().ID === message.Content.ResourceID) {
                store.commit('SET_EDGE', '');
                router.push({
                  name: 'resource-dashboard',
                  params: { tenant: store.getters.Tenant().TenantName },
                });
              }
            } else if (message.Content.ResourceType === 'environment') {
              if (store.getters.Environment().ID === message.Content.ResourceID) {
                store.commit('SET_EDGE', '');
                router.push({
                  name: 'resource-dashboard',
                  params: { tenant: store.getters.Tenant().TenantName },
                });
              }
            } else if (message.Content.ResourceType === 'cluster') {
              store.commit('CLEAR_CLUSTER');
              store.commit('SET_EDGE', '');
              router.push({
                name: 'resource-dashboard',
                params: { tenant: store.getters.Tenant().TenantName },
              });
            } else if (message.Content.ResourceType === 'application') {
              if (route.path.indexOf('apps') > -1) {
                store.commit('SET_EDGE', '');
                router.push({
                  name: 'app-list',
                  params: params.value,
                  query: query.value,
                });
              }
            }
          } else if (message.EventKind === 'update') {
            if (['tenant', 'project', 'environment'].indexOf(message.Content.ResourceType) > -1) {
              store.commit('SET_EDGE', '');
              router.push({
                name: 'resource-dashboard',
                params: { tenant: store.getters.Tenant().TenantName },
              });
            }
          }
        }
      } else if (message.MessageType === 'approve') {
        store.commit('SET_SNACKBAR', {
          text: `${message.Content.Detail}`,
          color: 'success',
        });
        getApproveList();
      } else if (message.MessageType === 'alert') {
        store.commit('SET_SNACKBAR', {
          text: `${message.Content.Detail}`,
          color: 'warning',
        });
        if (!state.alertTimeout) {
          getMessageList();
          state.alertTimeout = setTimeout(() => {
            clearTimeout(state.alertTimeout);
            state.alertTimeout = null;
          }, 1000);
        }
      }
    },
    { deep: true },
  );
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
