<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" title="节点">
          <template #content>
            {{ pod ? pod.spec.nodeName : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="容器组IP">
          <template #content>
            {{ pod ? pod.status.podIP : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="节点IP">
          <template #content>
            {{ pod ? pod.status.hostIP : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="QOS">
          <template #content>
            {{ pod ? pod.status.qosClass : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="容器" />
      <DetailContainer :containers="pod ? pod.spec.containers : []" />
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="卷" />
      <DetailVolume :volumes="pod ? pod.spec.volumes : []" />
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="环境变量" />
      <DetailEnv :containers="pod ? pod.spec.containers : []" />
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="状况" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Type</th>
              <th class="text-left">状态</th>
              <th class="text-left">上次改变时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in pod ? pod.status.conditions : []" :key="index">
              <td>{{ item.type }}</td>
              <td>
                <span v-if="item.status === 'True'">
                  <v-icon color="primary" small> fas fa-check-circle </v-icon>
                </span>
                <span v-else>
                  <v-icon color="error" small>fas fa-minus-circle</v-icon>
                </span>
              </td>
              <td>{{ $moment(item.lastUpdateTime).format('lll') }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import DetailContainer from '@/views/resource/components/common/DetailContainer';
  import DetailEnv from '@/views/resource/components/common/DetailEnv';
  import DetailVolume from '@/views/resource/components/common/DetailVolume';

  export default {
    name: 'ResourceInfo',
    components: {
      DetailContainer,
      DetailEnv,
      DetailVolume,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        pod: null,
      };
    },
    watch: {
      item() {
        this.pod = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.pod = deepCopy(this.item);
    },
  };
</script>
