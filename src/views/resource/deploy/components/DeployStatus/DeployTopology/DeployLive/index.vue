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
  <BasePanel
    v-model="panel"
    icon="mdi-dots-circle"
    :title="$t('tip.realtime_status')"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-2"> {{ resource ? resource.kind : '' }}/{{ resource ? resource.name : '' }} </span>
    </template>
    <template #action>
      <v-sheet v-if="resource && resource.kind === 'Pod'" class="text-subtitle-1 mt-n1 white--text primary">
        <v-menu
          v-model="containerMenu"
          bottom
          left
          nudge-bottom="5px"
          offset-y
          origin="top center"
          transition="scale-transition"
        >
          <template #activator="{ on }">
            <v-btn class="white--text primary" color="white" dark depressed v-on="on">
              {{ container }}
              <v-icon v-if="containerMenu" right> mdi-chevron-up </v-icon>
              <v-icon v-else right> mdi-chevron-down </v-icon>
            </v-btn>
          </template>
          <v-data-iterator hide-default-footer :items="[{ text: $root.$t('resource.container'), values: containers }]">
            <template #no-data>
              <v-card>
                <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text" flat min-width="120">
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>{{ $root.$t('resource.container') }}</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <v-list-item
                    v-for="(con, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center mx-2"
                    link
                    :style="{ color: con.text === container ? `#1e88e5 !important` : `` }"
                    @click="setContainer(con)"
                  >
                    <v-list-item-content>
                      <span class="font-weight-medium">{{ con.text }}</span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
    </template>
    <template #content>
      <v-card-text class="ma-0 pa-0">
        <v-tabs v-model="tab" class="rounded-t pa-0 v-tabs--default" fixed-tabs height="45">
          <v-tab v-for="item in tabItems" :key="item.value">
            {{ item.text }}
          </v-tab>
        </v-tabs>

        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" :container="container" :resource="resource" />
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../../../i18n';
  import DeployDiffYaml from './DeployDiffYaml';
  import DeployEvent from './DeployEvent';
  import DeployLiveYaml from './DeployLiveYaml';
  import DeployLog from './DeployLog';
  import DeployResult from './DeployResult';
  import { getPodDetail } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'DeployLive',
    i18n: {
      messages: messages,
    },
    components: {
      DeployDiffYaml,
      DeployEvent,
      DeployLiveYaml,
      DeployLog,
      DeployResult,
    },
    mixins: [BaseResource],
    data: () => ({
      panel: false,
      containerMenu: false,
      resource: null,
      items: [],
      tab: 0,
      container: '',
      containers: [],
    }),
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Tenant', 'Project']),
      tabItems() {
        if (this.resource && this.resource.kind === 'Pod') {
          return [
            { text: this.$t('tab.resource_live'), value: 'DeployLiveYaml' },
            { text: this.$t('tab.resource_diff'), value: 'DeployDiffYaml' },
            { text: this.$root.$t('tab.event'), value: 'DeployEvent' },
            { text: this.$t('tab.log'), value: 'DeployLog' },
          ];
        } else if (this.resource && this.resource.kind === 'Application') {
          return [
            { text: this.$t('tab.resource_live'), value: 'DeployLiveYaml' },
            { text: this.$t('tab.app_status'), value: 'DeployResult' },
          ];
        } else {
          return [
            { text: this.$t('tab.resource_live'), value: 'DeployLiveYaml' },
            { text: this.$t('tab.resource_diff'), value: 'DeployDiffYaml' },
            { text: this.$root.$t('tab.event'), value: 'DeployEvent' },
          ];
        }
      },
    },
    methods: {
      open() {
        this.panel = true;
      },
      init(resource) {
        this.resource = deepCopy(resource);
        if (this.resource && this.resource.kind === 'Pod') {
          this.podDetail();
        }
      },
      async podDetail() {
        const data = await getPodDetail(this.ThisCluster, this.resource.namespace, this.resource.name);
        this.containers = [];
        data.spec.containers.forEach((container) => {
          this.containers.push({ text: container.name, value: container.name });
        });
        if (data.spec.containers && data.spec.containers.length > 0) {
          this.container = data.spec.containers[0].name;
        }
      },
      setContainer(con) {
        if (this.container !== con.value) {
          this.container = con.value;
          this.$nextTick(() => {
            this.$refs[this.tabItems[this.tab].value].refresh();
          });
        }
      },
      dispose() {
        this.items = [];
        this.tab = 0;
      },
    },
  };
</script>
