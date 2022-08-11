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
  <v-card class="my-3" flat>
    <BaseSubTitle class="pt-2" :divider="false" :title="$t('event.event')">
      <template #selector>
        <v-sheet class="text-body-2 text--darken-1">
          {{ $t('event.cluster') }}
          <v-menu
            v-model="eventMenu"
            bottom
            left
            nudge-bottom="5px"
            offset-y
            origin="top center"
            transition="scale-transition"
          >
            <template #activator="{ on }">
              <v-btn
                class="primary--text font-weight-medium"
                color="white"
                dark
                depressed
                small
                v-on="on"
                @click="m_select_clusterSelectData(Tenant().ID)"
              >
                {{ clusterName }}
                <v-icon v-if="eventMenu" right> mdi-chevron-up </v-icon>
                <v-icon v-else right> mdi-chevron-down </v-icon>
              </v-btn>
            </template>
            <v-data-iterator
              hide-default-footer
              :items="[{ text: $t('event.cluster'), values: m_select_clusterItems }]"
            >
              <template #no-data>
                <v-card>
                  <v-card-text>{{ $root.$t('data.no_data') }} </v-card-text>
                </v-card>
              </template>
              <template #default="props">
                <v-card v-for="item in props.items" :key="item.text" flat min-width="100px">
                  <v-list dense>
                    <v-flex class="text-subtitle-2 text-center ma-2">
                      <span>{{ $t('event.cluster') }}</span>
                    </v-flex>
                    <v-divider class="mx-2" />
                    <v-list-item
                      v-for="(cluster, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center font-weight-medium mx-2"
                      link
                      :style="{ color: cluster.text === clusterName ? `#1e88e5 !important` : `` }"
                      @click="setCluster(cluster)"
                    >
                      <v-list-item-content>
                        <span>{{ cluster.text }}</span>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </template>
            </v-data-iterator>
          </v-menu>
        </v-sheet>
      </template>
      <template #action>
        <v-btn class="float-right mr-2" color="primary" small text @click="toEvent">
          <v-icon left small> mdi-more </v-icon>
          {{ $t('more') }}
        </v-btn>
      </template>
    </BaseSubTitle>
    <v-card-text>
      <template v-if="pluginPass.length === 0">
        <v-flex v-if="eventItems.length === 0" class="text-body-2" :style="{ position: 'relative', height: '300px' }">
          <span class="kubegems__full-center kubegems__text"> {{ $root.$t('data.no_data') }} </span>
        </v-flex>
        <div class="align-items-center">
          <div class="vs-scrollable">
            <div v-for="(item, index) in eventItems" :key="index" class="comment-widgets position-relative">
              <div class="d-flex flex-row comment-row mt-0 py-1">
                <div class="pa-2">
                  <v-badge
                    v-if="item.stream.count > 1"
                    bordered
                    :color="$EVENT_STATUS_COLOR[item.stream.type]"
                    :content="item.stream.count >= 100 ? '99+' : item.stream.count"
                    overlap
                  >
                    <v-avatar :color="$EVENT_STATUS_COLOR[item.stream.type]" size="45">
                      <span class="white--text text-h6">
                        {{ item.stream.type[0].toLocaleUpperCase() }}
                      </span>
                    </v-avatar>
                  </v-badge>
                  <v-avatar v-else :color="$EVENT_STATUS_COLOR[item.stream.type]" size="45">
                    <span class="white--text text-h6">{{ item.stream.type[0].toLocaleUpperCase() }}</span>
                  </v-avatar>
                </div>
                <div class="comment-text pl-5">
                  <h3 class="font-weight-regular mb-2">
                    {{ item.stream.reason }}
                  </h3>
                  <span
                    :class="`d-block my-0 text-subtitle-2 font-weight-regular kubegems__break-all ${messageClass[index]}`"
                    @mouseout="$set(messageClass, index, 'event--collapse')"
                    @mouseover="$set(messageClass, index, 'event--show')"
                  >
                    {{ item.stream.message }}
                  </span>
                  <div class="comment-footer">
                    <span class="text-muted mr-2">
                      {{
                        item.stream.lastTimestamp
                          ? $moment(item.stream.lastTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                          : item.stream.eventTime
                          ? $moment(item.stream.eventTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                          : ''
                      }}
                    </span>

                    <v-chip class="mx-1 white--text component-chip" color="grey" label x-small>
                      <v-icon left x-small> mdi-label </v-icon>
                      {{ item.stream.source_component }}
                    </v-chip>
                  </div>
                </div>
              </div>
              <v-divider class="mb-2 mt-2" />
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="text-body-2" :style="{ position: 'relative', height: '300px' }">
          <span class="kubegems__full-center kubegems__text"> 插件{{ pluginPass.join(',') }}未启用 </span>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getClusterPluginsList, getEventListFromLoki } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'EventList',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      eventItems: [],
      clusterName: '',
      messageClass: ['event--collapse', 'event--collapse', 'event--collapse', 'event--collapse', 'event--collapse'],
      eventMenu: false,
      pluginPass: [],
    }),
    computed: {
      ...mapState(['JWT', 'Admin']),
      ...mapGetters(['Tenant']),
    },
    async mounted() {
      if (this.JWT) {
        if (this.Tenant().ID > 0) {
          await this.m_select_clusterSelectData(this.Tenant().ID);
          if (this.m_select_clusterItems.length > 0) {
            this.clusterName = this.m_select_clusterItems[0].text;
            this.loadPluginPass();
          }
        }
      }
    },
    methods: {
      async loadPluginPass() {
        const data = await getClusterPluginsList(this.clusterName, {
          simple: true,
          noprocessing: true,
        });
        if (!data['logging']) {
          this.pluginPass.push('logging');
        }
        if (!data['eventer']) {
          this.pluginPass.push('eventer');
        }
        if (this.pluginPass.length === 0) {
          this.eventList();
        }
      },
      async eventList() {
        let query = '{container="event-exporter", stream="stdout"} | json | __error__=``';
        await this.m_select_environmentSelectData(this.Tenant().ID);
        const ns = [];
        if (this.m_select_environmentItems.length > 0) {
          this.m_select_environmentItems.forEach((e) => {
            ns.push(`^${e.value}$`);
          });
          query += ` | line_format "{{.metadata_namespace}}" |~ "${ns.join('|')}"`;
        } else return;
        const data = await getEventListFromLoki(this.clusterName, {
          query: query,
          limit: 5,
          start: Date.parse(this.$moment(new Date(new Date().setHours(new Date().getHours() - 24))).utc()) + '000000',
          end: Date.parse(this.$moment(new Date()).utc()) + '000000',
          noprocessing: true,
        });
        this.eventItems = data || [];
      },
      setCluster(cluster) {
        if (cluster.text !== this.clusterName) {
          this.clusterName = cluster.text;
          this.loadPluginPass();
        }
      },
      toEvent() {
        this.$router.push({
          name: 'event-list',
          params: {
            tenant: this.Tenant().TenantName,
          },
          query: {
            clustername: this.clusterName,
            tenant: this.Tenant().TenantName,
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .event--collapse {
    min-height: 22px;
    max-height: 43px;
    overflow: hidden;
  }
  .event--show {
    min-height: 22px;
    height: auto;
    overflow: auto;
  }
  .component-chip {
    max-width: 250px;
    word-break: break-all;
    white-space: initial;
    height: auto;
  }
</style>
