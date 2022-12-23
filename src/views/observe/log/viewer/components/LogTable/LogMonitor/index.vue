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
    icon="mdi-chart-areaspline-variant"
    :title="$t('tip.container_monitor')"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-3 text-subtitle-2 white--text">
        {{ item ? item.info.timestampstr : '' }}
      </span>
    </template>
    <template #action>
      <v-flex class="float-right">
        <v-sheet class="text-body-1 text--darken-1 primary white--text">
          <BaseDatetimePicker v-model="date" color="primary" :default-value="30" />
        </v-sheet>
      </v-flex>
    </template>
    <template #content>
      <DashboardCard :item="item" />

      <div class="ma-5">
        <div class="py-2 text-body-1">{{ $t('tip.log_content') }}</div>
        <div class="text-body-2">
          {{ item ? item.info.message : '' }}
        </div>
      </div>

      <v-divider class="mx-4 mb-2" />

      <v-tabs v-model="tab" class="rounded-t pa-3 mx-2" height="30">
        <v-tab v-for="item in tabItems" :key="item.value">
          {{ item.text }}
        </v-tab>
      </v-tabs>

      <component :is="tabItems[tab].value" :date="date" :item="item" />
    </template>
  </BasePanel>
</template>

<script>
  import messages from '../../../../i18n';
  import ContainerMonitor from './ContainerMonitor';
  import DashboardCard from './DashboardCard';
  import LogLabel from './LogLabel';
  import NodeMonitor from './NodeMonitor';
  import PodMonitor from './PodMonitor';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'LogMonitor',
    i18n: {
      messages: messages,
    },
    components: {
      ContainerMonitor,
      DashboardCard,
      LogLabel,
      NodeMonitor,
      PodMonitor,
    },
    data() {
      return {
        panel: false,
        date: [],
        item: null,
        tab: 0,
      };
    },
    computed: {
      tabItems() {
        return [
          { text: this.$t('tip.label'), value: 'LogLabel' },
          { text: this.$root.$t('resource.host'), value: 'NodeMonitor' },
          { text: this.$root.$t('resource.container'), value: 'ContainerMonitor' },
          { text: this.$root.$t('resource.pod'), value: 'PodMonitor' },
        ];
      },
    },
    methods: {
      init(item) {
        this.item = deepCopy(item);
        const start = this.$moment(this.item.info.timestampstr).utc().add(-15, 'minutes').format();
        const end = this.$moment(this.item.info.timestampstr).utc().add(15, 'minutes').format();
        this.date = [start, end];
      },
      open() {
        this.panel = true;
      },
      dispose() {
        return;
      },
    },
  };
</script>
