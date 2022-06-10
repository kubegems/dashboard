<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail title="IP" :mt="0">
          <template #content>
            {{ service ? service.spec.clusterIP : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="类型">
          <template #content>
            {{ service ? service.spec.type : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="匹配标签">
          <template #content>
            <BaseCollapseChips v-if="service" :chips="service.spec.selector || {}" single-line icon="mdi-label" />
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle title="服务端口" :divider="false" class="pt-2" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">容器端口</th>
              <th class="text-left">服务端口</th>
              <th class="text-left">主机端口</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in service ? service.spec.ports : []" :key="index">
              <td>
                <v-chip color="success" text-color="white" class="ma-1 font-weight-medium" small>
                  {{ item.targetPort }}｜{{ item.protocol }}
                </v-chip>
              </td>
              <td>
                <v-chip color="success" text-color="white" class="ma-1 font-weight-medium" small>
                  {{ item.port }}｜{{ item.protocol }}
                </v-chip>
              </td>
              <td>{{ item.nodePort }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'ResourceInfo',
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        service: null,
      };
    },
    watch: {
      item() {
        this.service = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.service = deepCopy(this.item);
    },
  };
</script>
