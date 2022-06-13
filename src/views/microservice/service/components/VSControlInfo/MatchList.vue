<template>
  <v-data-table disable-sort :headers="headers" hide-default-footer :items="items" no-data-text="暂无数据">
    <template #[`item.rule`]="{ item }">
      <v-flex v-for="(v, k) in item.rule" :key="k"> {{ k }} => {{ v }} </v-flex>
    </template>
  </v-data-table>
</template>

<script>
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'MatchList',
    mixins: [BaseResource],
    props: {
      matchs: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        items: [],
        headers: [
          { text: '匹配类型', value: 'type', align: 'start', width: '50%' },
          { text: '匹配规则', value: 'rule', align: 'start' },
        ],
      };
    },
    watch: {
      matchs: {
        handler: function () {
          this.items = [];
          if (this.matchs) {
            this.matchs.forEach((m) => {
              for (const key in m) {
                this.items.push({
                  type: key,
                  rule: m[key],
                });
              }
            });
          }
        },
        immediate: true,
      },
    },
  };
</script>
