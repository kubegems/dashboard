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
  <div id="channel_center" class="card" :style="{ height: `${height}px`, overflowY: 'auto' }">
    <v-row v-scroll:#model__store="$_.debounce(onScroll, 50)" class="mt-0">
      <v-col v-for="(item, index) in items" :key="index" class="pt-0" cols="3">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto card__pos" :elevation="hover ? 5 : 0" flat height="100%">
            <v-list-item class="mb-5" three-line>
              <v-list-item-avatar size="80" tile>
                <BaseLogo :icon-name="item.channelConfig.channelType" :ml="0" :width="60" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-subtitle-1 mb-3 card__title">
                  <a>{{ item.name }}</a>
                </v-list-item-title>

                <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                  {{ $t('table.channel') }} : {{ item.channelConfig.channelType }}
                </v-list-item-subtitle>
                <template v-if="item.channelConfig.channelType === 'webhook'">
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                    URL : {{ item.channelConfig.url }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                    {{ $t('tip.skip_verify') }} :
                    <v-icon v-if="item.channelConfig.insecureSkipVerify" class="ml-1" color="success" small>
                      mdi-check-circle
                    </v-icon>
                    <v-icon v-else class="ml-1" color="error" small>mdi-close-circle</v-icon>
                  </v-list-item-subtitle>
                </template>
                <template v-else-if="item.channelConfig.channelType === 'feishu'">
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                    URL : {{ item.channelConfig.url }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                    {{ $t('tip.user_id') }} : {{ item.channelConfig.at }}
                  </v-list-item-subtitle>
                </template>
                <template v-else-if="item.channelConfig.channelType === 'email'">
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                    {{ $t('tip.send') }} : {{ item.channelConfig.from }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                    {{ $t('tip.smtp') }} : {{ item.channelConfig.smtpServer }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                    {{ $t('tip.recv') }} : {{ item.channelConfig.to }}
                  </v-list-item-subtitle>
                </template>
                <template v-else-if="item.channelConfig.channelType === 'aliyunMsg'">
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                    {{ $t('tip.phone') }} : {{ item.channelConfig.phoneNumbers }}
                  </v-list-item-subtitle>
                </template>
                <template v-else-if="item.channelConfig.channelType === 'aliyunVoice'">
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                    {{ $t('tip.phone') }} : {{ item.channelConfig.callNumber }}
                  </v-list-item-subtitle>
                </template>
                <template v-else-if="item.channelConfig.channelType === 'dingding'">
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
                    {{ $t('tip.phone') }} : {{ item.channelConfig.atMobiles }}
                  </v-list-item-subtitle>
                </template>
              </v-list-item-content>
            </v-list-item>
            <v-card-actions class="pl-4 pr-2 py-0 mb-2" :style="{ position: 'absolute', bottom: '0', width: '100%' }">
              <v-spacer />
              <v-btn color="primary" small text @click="updateChannel(item)"> {{ $root.$t('operate.edit') }} </v-btn>
              <v-btn color="primary" small text @click="sendChannelTest(item)">
                {{ $t('operate.test') }}
              </v-btn>
              <v-btn color="error" small text @click="removeChannel(item)"> {{ $root.$t('operate.delete') }} </v-btn>
            </v-card-actions>

            <v-flex v-if="item.name.endsWith('default-webhook')" class="card__watermark-bg" />
            <v-flex
              v-if="item.name.endsWith('default-webhook')"
              :class="`${Locale === 'en' ? 'card__watermark-en' : 'card__watermark'} font-weight-medium`"
            >
              {{ $t('table.default') }}
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
      <v-col v-if="m_permisson_tenantAllow()" class="pt-0" cols="3">
        <v-card class="kubegems__full-height" flat min-height="188">
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item class="kubegems__full-height" three-line>
              <v-list-item-content>
                <v-btn block class="text-h6" color="primary" text @click="addChannel">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.add_c', [$t('resource.channel')]) }}
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="loading" class="my-3 py-2 text-center card__scroll__loading">
      <BaseDropProgress />
    </div>

    <v-btn
      v-if="offsetTop"
      bottom
      class="card__top"
      color="primary"
      direction="left"
      fab
      fixed
      right
      transition="slide-x-reverse-transition"
      @click="goToTop"
    >
      <v-icon>mdi-chevron-double-up</v-icon>
    </v-btn>

    <AddChannel ref="addChannel" @refresh="channelList" />
    <UpdateChannel ref="updateChannel" @listStatus="listStatus" @refresh="channelList" />
    <ChannelUpdateTip ref="channelUpdateTip" :status="updateStatus" />
  </div>
</template>

<script>
  import { deleteChannel, getChannelList, postSendTestChannel } from '@kubegems/api/direct';
  import { convertResponse2Pagination } from '@kubegems/api/utils';
  import BasePermission from '@kubegems/mixins/permission';
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import AddChannel from './AddChannel';
  import ChannelUpdateTip from './ChannelUpdateTip.vue';
  import UpdateChannel from './UpdateChannel';

  export default {
    name: 'ChannelCard',
    i18n: {
      messages: messages,
    },
    components: {
      AddChannel,
      ChannelUpdateTip,
      UpdateChannel,
    },
    mixins: [BasePermission],
    data() {
      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 28,
        },
        offsetTop: 0,
        loading: false,
        updateStatus: {},
      };
    },
    computed: {
      ...mapState(['Scale', 'Locale']),
      ...mapGetters(['Tenant']),
      height() {
        return parseInt((window.innerHeight - 148) / this.Scale);
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.items = [];
        this.pageCount = 0;
        this.page = 1;
        this.channelList();
      });
    },
    methods: {
      async channelList(append = false) {
        let queryParams = { ...this.params, ...this.$route.query };
        if (append) {
          queryParams = { ...queryParams, noprocessing: true };
        }
        const data = await getChannelList(this.Tenant().ID, queryParams);
        const pagination = convertResponse2Pagination(data);
        if (append) {
          this.items = this.items.concat(pagination.items);
        } else {
          this.items = pagination.items;
        }
        this.pageCount = pagination.pageCount;
        this.params.page = pagination.page;
        this.$router.replace({ query: { ...this.$route.query } });
      },
      async onScroll(e) {
        this.offsetTop = e.target.scrollTop;
        if (e.target.scrollTop + document.getElementById('channel_center').clientHeight >= e.target.scrollHeight - 1) {
          this.params.page += 1;
          if (this.pageCount < this.params.page) return;
          this.loading = true;
          await this.channelList(true);
          this.loading = false;
        }
      },
      goToTop() {
        const container = document.getElementById('channel_center');
        container.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
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
              await postSendTestChannel(this.Tenant().ID, param.item.id);
              this.$store.commit('SET_SNACKBAR', {
                text: this.$t('tip.test_success'),
                color: 'success',
              });
            }
          },
        });
      },
      addChannel() {
        this.$refs.addChannel.open();
      },
      listStatus(status) {
        this.updateStatus = status;
        this.$refs.channelUpdateTip.open();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .card {
    position: relative;

    &__desc {
      line-height: 24px;
      display: flex;
      word-break: break-all;
    }

    &__title {
      word-break: break-word;
      white-space: break-spaces;
      font-weight: bold;
      max-height: 57px;
    }

    &__top {
      bottom: 75px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }

    &__scroll {
      &__loading {
        position: relative;
        height: 70px;
      }
    }

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 105px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: #1e88e5;
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 10px;
      right: 7px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }

    &__watermark-en {
      position: absolute;
      top: 14px;
      right: 0;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }
  }
</style>
