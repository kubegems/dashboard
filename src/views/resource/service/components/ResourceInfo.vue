<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" title="IP">
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
            <BaseCollapseChips
              v-if="service"
              id="s_selector"
              :chips="service.spec.selector || {}"
              icon="mdi-label"
              single-line
            />
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" title="服务端口" />
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
                <v-chip class="ma-1 font-weight-medium" color="success" small text-color="white">
                  {{ item.targetPort }}｜{{ item.protocol }}
                </v-chip>
              </td>
              <td>
                <v-chip class="ma-1 font-weight-medium" color="success" small text-color="white">
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
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

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
