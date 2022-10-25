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
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.channel_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu v-if="m_permisson_tenantAllow()" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addChannel">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.create_c', [$t('resource.channel')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="kubegems__table-row-pointer mx-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="id"
        :items="items"
        :items-per-page="itemsPerPage"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="page"
        show-expand
        single-expand
        @click:row="onRowClick"
        @page-count="pageCount = $event"
      >
        <template #[`item.channel`]="{ item }">
          <span>{{ item.channelConfig.channelType }}</span>
        </template>
        <template #expanded-item="{ headers, item }">
          <td class="my-2 py-2" :colspan="headers.length">
            <v-flex v-if="item.channelConfig.channelType === 'webhook'" class="text-body-2 break-word my-1">
              <div class="text-subtitle-2 kubegems__text">
                {{ `Webhook: ` }}
              </div>
              <a class="ml-2">{{ item.channelConfig.url }}</a>
            </v-flex>

            <v-flex v-if="item.channelConfig.channelType === 'email'" class="text-body-2 break-word my-1">
              <div class="text-subtitle-2 kubegems__text">
                {{ `${$t('tip.email')}: ` }}
              </div>
              <v-flex class="ml-2">
                <div>{{ $t('tip.send') }} : {{ item.channelConfig.from }}</div>
                <div>{{ $t('tip.smtp') }} : {{ item.channelConfig.smtpServer }}</div>
                <span>{{ $t('tip.recv') }} : </span>
                <v-chip
                  v-for="(item, key) in item.channelConfig.to.split(',')"
                  :key="key"
                  class="mx-1"
                  color="success"
                  small
                >
                  {{ item }}
                </v-chip>
              </v-flex>
            </v-flex>

            <v-flex v-if="item.channelConfig.channelType === 'feishu'" class="text-body-2 break-word my-1">
              <div class="text-subtitle-2 kubegems__text">
                {{ `${$t('tip.feishu')}: ` }}
              </div>
              <div>{{ `url : ${item.channelConfig.url}` }} </div>
              <template v-if="item.channelConfig.at">
                <span>{{ $t('tip.user_id') }} : </span>
                <v-chip
                  v-for="(item, key) in item.channelConfig.at.split(',')"
                  :key="key"
                  class="mx-1"
                  color="success"
                  small
                >
                  {{ item }}
                </v-chip>
              </template>
            </v-flex>
          </td>
        </template>
        <template #[`item.default`]="{ item }">
          <template v-if="item.name.endsWith('default-webhook')">
            <v-icon color="primary" small>mdi-check-circle</v-icon>
            {{ $t('tip.yes') }}
          </template>
          <template v-else>
            <v-icon color="error" small>mdi-close-circle</v-icon>
            {{ $t('tip.no') }}
          </template>
        </template>
        <template #[`item.action`]="{ item }">
          <template v-if="!item.name.endsWith('default-webhook')">
            <v-flex :id="`r${item.id}`" />
            <v-menu :attach="`#r${item.id}`" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click.stop="updateChannel(item)">
                      {{ $root.$t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="primary" small text @click.stop="sendChannelTest(item)">
                      {{ $t('operate.test') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click.stop="removeChannel(item)">
                      {{ $root.$t('operate.delete') }}
                    </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="channelList"
      />
    </v-card>

    <AddChannel ref="addChannel" @refresh="channelList" />
    <UpdateChannel ref="updateChannel" @refresh="channelList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddChannel from './components/AddChannel';
  import UpdateChannel from './components/UpdateChannel';
  import messages from './i18n';
  import { deleteChannel, getChannelList, getSendTestChannel } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'AlertChannel',
    i18n: {
      messages: messages,
    },
    components: {
      AddChannel,
      UpdateChannel,
    },
    mixins: [BaseFilter, BasePermission],
    data() {
      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
        },
      };
    },
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Tenant']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.channel'), value: 'channel', align: 'start' },
          { text: this.$t('table.default'), value: 'default', align: 'start' },
        ];
        if (this.m_permisson_resourceAllow(this.$route.query.env)) {
          items.push({ text: '', value: 'action', align: 'center', width: 20 });
        }
        items.push({ text: '', value: 'data-table-expand' });
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.channel_name'), value: 'search', items: [] }];
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.channelList();
        });
      }
    },
    methods: {
      async channelList(noprocess = false) {
        const data = await getChannelList(
          this.Tenant().ID,
          Object.assign(this.params, {
            noprocessing: noprocess,
          }),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
      },
      addChannel() {
        this.$refs.addChannel.open();
      },
      updateChannel(item) {
        this.$refs.updateChannel.init(item);
        this.$refs.updateChannel.open();
      },
      removeChannel(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$t('resource.channel')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$t('resource.channel')])} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.name.length > 0) {
              await deleteChannel(this.Tenant().ID, param.item.id);
              this.channelList();
            }
          },
        });
      },
      sendChannelTest(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.test_c', [this.$t('resource.channel')]),
          content: {
            text: this.$t('operate.test_c', [`${this.$t('resource.channel')} ${item.name}`]),
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.name.length > 0) {
              await getSendTestChannel(this.Tenant().ID, param.item.id);
              store.commit('SET_SNACKBAR', {
                text: this.$t('tip.test_success'),
                color: 'success',
              });
            }
          },
        });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
    },
  };
</script>
