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
  <v-card class="mt-3">
    <v-card-title class="py-4">
      <v-spacer />
    </v-card-title>
    <v-data-table
      class="mx-4"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
    >
      <template #[`item.name`]="{ item }">
        <a class="text-subtitle-2" @click.stop>
          {{ item.metadata.name }}
        </a>
      </template>
      <template #[`item.status`]="{ item }">
        <v-avatar
          class="mr-2"
          size="10"
          :style="`background-color: ${
            getStatus(item.status.conditions).join(',') === 'Ready'
              ? '#00BCD4'
              : getStatus(item.status.conditions).join(',') === 'Unknown'
              ? '#607D8B'
              : '#ff5252'
          };`"
        >
          <span class="white--text text-h5" />
        </v-avatar>
        {{ getStatus(item.status ? item.status.conditions : null).join(',') }}
      </template>
      <template #[`item.ip`]="{ item }">
        {{ item.status.addresses[0].address }}
      </template>
      <template #[`item.pod`]="{ item }">
        {{ item.podcount ? item.podcount : 0 }}
        / {{ item.status.capacity.pods }}
        <v-progress-linear
          class="rounded font-weight-medium"
          :color="getColor(item.podPercentage)"
          height="15"
          :value="item.podPercentage"
        >
          <span class="white--text"> {{ item.podPercentage }}% </span>
        </v-progress-linear>
      </template>
      <template #[`item.load`]="{ item }">
        <v-sheet :class="`text-subtitle-2 ${getLoadColor(item)} rounded text-center py-2 kubegems__text`">
          {{ item.load ? item.load : 0 }}
        </v-sheet>
      </template>
      <template #[`item.cpu`]="{ item }">
        {{ item.cpu }}
        /
        {{ item.status.capacity.cpu }}
        <v-progress-linear
          class="rounded font-weight-medium"
          :color="getColor(item.cpuPercentage)"
          height="15"
          :value="item.cpuPercentage"
        >
          <span class="white--text"> {{ item.cpuPercentage }}% </span>
        </v-progress-linear>
      </template>
      <template #[`item.memory`]="{ item }">
        {{ item.memory }}
        Gi / {{ sizeOfStorage(item.status.capacity.memory).toFixed(1) }}
        Gi
        <v-progress-linear
          class="rounded font-weight-medium"
          :color="getColor(item.memoryPercentage)"
          height="15"
          :value="item.memoryPercentage"
        >
          <span class="white--text"> {{ item.memoryPercentage }}% </span>
        </v-progress-linear>
      </template>
      <template #[`item.createAt`]="{ item }">
        {{ item.metadata.creationTimestamp ? moment(item.metadata.creationTimestamp).format('lll') : '' }}
      </template>
      <template #[`item.taint`]="{ item }">
        <v-chip
          v-for="(val, index) in getDistinctTaints(item.spec.taints)"
          :key="index"
          class="ma-1 font-weight-medium"
          color="success"
          small
          text-color="white"
        >
          {{ val }}
        </v-chip>
      </template>
      <template #[`item.role`]="{ item }">
        <span
          v-if="
            item.metadata.labels[`node-role.kubernetes.io/master`] === '' ||
            item.metadata.labels[`kubernetes.io/role`] === 'master'
          "
        >
          Master
        </span>
        <span v-else>Worker</span>
      </template>
      <template #[`item.action`]="{ item }">
        <v-flex :id="`r${item.metadata.resourceVersion}`" />
        <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2 text-center">
              <v-flex v-if="item.spec.unschedulable">
                <v-btn color="primary" small text @click="allowSchedule(item)">
                  {{ i18nLocal.t('operate.allow_schedule') }}
                </v-btn>
              </v-flex>
              <v-flex v-else>
                <v-btn color="error" small text @click="stopSchedule(item)">
                  {{ i18nLocal.t('operate.stop_schedule') }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-data-table>

    <BasePagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :page-count="pagination.pageCount"
      :size="pagination.size"
      @changepage="pageChange"
      @changesize="sizeChange"
      @loaddata="getNodeList"
    />
  </v-card>
</template>

<script lang="ts" setup>
  import { V1NodeCondition } from '@kubernetes/client-node/dist/gen/model/v1NodeCondition';
  import { V1Taint } from '@kubernetes/client-node/dist/gen/model/v1Taint';
  import * as moment from 'moment';
  import { onMounted, reactive } from 'vue';

  import { useI18n } from '../i18n';
  import { useNodePagination } from '@/composition/node';
  import { useRoute, useRouter } from '@/composition/router';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { Node } from '@/types/node';
  import { sizeOfStorage } from '@/utils/helpers';

  onMounted(() => {
    getNodeList();
  });

  const route = useRoute();
  const router = useRouter();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: 'IP', value: 'ip', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'status', align: 'start', width: 150 },
    { text: i18nLocal.t('table.role'), value: 'role', align: 'start' },
    { text: i18nLocal.t('table.taint'), value: 'taint', align: 'start' },
    { text: i18nLocal.t('table.load'), value: 'load', align: 'start', width: 100 },
    { text: i18n.t('resource.cpu'), value: 'cpu', align: 'start', width: 150 },
    { text: i18n.t('resource.memory'), value: 'memory', align: 'start', width: 150 },
    { text: i18n.t('resource.pod'), value: 'pod', align: 'start', width: 150 },
    { text: i18nLocal.t('table.join_at'), value: 'createAt', align: 'start', width: 180 },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<Node> = reactive<Pagination<Node>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getNodeList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Node> = await useNodePagination(new Node(), route.params.name, params.page, params.size);
    pagination = Object.assign(pagination, data);
    router.replace({ query: { ...route.query, page: pagination.page.toString(), size: pagination.size.toString() } });
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const getStatus = (conditions: V1NodeCondition[]): string[] => {
    const tmpConditions = [];
    if (conditions && conditions.length === 0) return ['Unknown'];
    conditions.forEach((con: V1NodeCondition) => {
      if (con.type === 'Ready') {
        if (con.status === 'True') {
          tmpConditions.push(con.type);
          return tmpConditions;
        } else if (con.status === 'Unknown') {
          tmpConditions.push('Unknown');
        } else {
          tmpConditions.push('NotReady');
        }
      } else {
        if (con.status === 'True') {
          tmpConditions.push(con.type);
        }
      }
    });

    if (tmpConditions.length > 1 && tmpConditions.indexOf('Ready') > -1) {
      const index = tmpConditions.indexOf('Ready');
      tmpConditions.splice(index, 1);
    }

    return tmpConditions;
  };

  const getDistinctTaints = (taints: V1Taint[]): V1Taint[] => {
    if (taints === undefined) return [];
    const t = [];
    taints.forEach((taint: V1Taint) => {
      if (t.indexOf(taint.effect) === -1) {
        t.push(taint.effect);
      }
    });
    return t;
  };

  const getLoadColor = (item) => {
    const cpu = parseFloat(item.status.capacity.cpu);
    if (item.load > cpu) {
      return 'red lighten-3';
    }
    return 'green lighten-4';
  };

  const getColor = (percentage: number): string => {
    return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
  };

  const allowSchedule = (item: Node) => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.allow_schedule'),
      content: {
        text: `${i18nLocal.t('operate.allow_schedule')} ${item.metadata.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new Node(param.item).patchCordonNode(route.params.name, true);
        getNodeList();
      },
    });
  };
  const stopSchedule = (item: Node) => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.stop_schedule'),
      content: {
        text: `${i18nLocal.t('operate.stop_schedule')} ${item.metadata.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new Node(param.item).patchCordonNode(route.params.name, false);
        getNodeList();
      },
    });
  };
</script>
