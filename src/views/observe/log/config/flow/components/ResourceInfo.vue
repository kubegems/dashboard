<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" title="匹配应用">
          <template #content>
            <BaseCollapseChips v-if="flow" id="r_app" :chips="matchs" icon="mdi-apps" single-line />
          </template>
        </BaseListItemForDetail>
        <BaseListItemForDetail title="过滤器">
          <template #content>
            <BaseCollapseChips v-if="flow" id="r_fliter" :chips="filters" icon="mdi-filter" single-line />
          </template>
        </BaseListItemForDetail>
        <BaseListItemForDetail title="路由器(Output)">
          <template #content>
            <BaseCollapseChips
              v-if="flow"
              id="r_output"
              :chips="flow.spec.localOutputRefs"
              icon="mdi-router-wireless"
              single-line
            />
          </template>
        </BaseListItemForDetail>
        <BaseListItemForDetail title="路由器(ClusterOutput)">
          <template #content>
            <BaseCollapseChips
              v-if="flow"
              id="r_clusteroutput"
              :chips="flow.spec.globalOutputRefs"
              icon="mdi-router-wireless"
              single-line
            />
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>
  </div>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        flow: null,
      };
    },
    computed: {
      matchs() {
        if (this.flow.spec.match) {
          return this.flow.spec.match.length > 1
            ? this.flow.spec.match.reduce((m1, m2) => {
                return Array.isArray(m1)
                  ? m1.concat([m2.select.labels.app])
                  : [m1.select.labels.app].concat([m2.select.labels.app]);
              })
            : this.flow.spec.match.map((m) => {
                return m.select.labels.app;
              });
        }
        return [];
      },
      filters() {
        return this.flow.spec.filters.length > 1
          ? this.flow.spec.filters.reduce((f1, f2) => {
              return Array.isArray(f1) ? f1.concat(Object.keys(f2)) : Object.keys(f1).concat(Object.keys(f2));
            })
          : this.flow.spec.filters
              .map((f) => {
                return Object.keys(f);
              })
              .flat();
      },
    },
    watch: {
      item() {
        this.flow = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.flow = deepCopy(this.item);
    },
  };
</script>
