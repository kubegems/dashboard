<template>
  <v-data-table
    class="mx-4"
    disable-sort
    :headers="headers"
    hide-default-footer
    :items="workloads"
    no-data-text="暂无数据"
  >
    <template #[`item.name`]="{ item, index }">
      <v-flex :id="`r${index}`" />
      <a class="text-subtitle-2" @click="microAppWorkoladDetail(item)">
        <v-flex class="float-left">
          {{ item.name }}
        </v-flex>
        <v-flex v-if="item.istioSidecar" class="float-left ml-2">
          <v-menu :attach="`#r${index}`" :close-delay="200" open-on-hover top>
            <template #activator="{ on }">
              <span v-on="on">
                <Icon class="mr-2 primary--text" height="18px" icon="simple-icons:istio" width="18px" />
              </span>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <span>自动注入</span>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </a>
    </template>
    <template #[`item.labels`]="{ item }">
      <BaseCollapseChips v-if="item" :chips="item.labels || {}" icon="mdi-label" single-line />
    </template>
    <template #[`item.createdAt`]="{ item }">
      {{ item.createdAt ? $moment(item.createdAt).format('lll') : '' }}
    </template>
  </v-data-table>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import BaseResource from '@/mixins/resource';

  export default {
    name: 'WorkloadList',
    mixins: [BaseResource],
    props: {
      workloads: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        headers: [
          { text: '名称', value: 'name', align: 'start' },
          { text: '类型', value: 'type', align: 'start' },
          { text: '容器组数量', value: 'podCount', align: 'start' },
          { text: '标签', value: 'labels', align: 'start', width: 500 },
          { text: '创建时间', value: 'createdAt', align: 'start' },
        ],
      };
    },
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      microAppWorkoladDetail(item) {
        this.$router.push({
          name: 'microworkload-detail',
          params: { name: item.name },
          query: {
            type: item.type,
            namespace: this.$route.query.namespace,
            cluster: this.$route.query.cluster,
            environment: this.$route.query.environment,
            environmentid: this.$route.query.environmentid,
          },
        });
      },
    },
  };
</script>
