<template>
  <v-card>
    <v-card-text class="pa-0 pt-1">
      <BaseSubTitle title="污点" :divider="false">
        <template #action>
          <v-btn small text color="primary" class="float-right mr-2" @click="addTaint">
            <v-icon left small> mdi-tag-plus </v-icon>
            添加污点
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-flex class="pb-4">
        <v-sheet v-for="(t, index) in taint.spec.taints" :key="index" class="ml-2">
          <v-chip
            small
            class="my-1"
            color="success"
            text-color="white"
            close
            close-icon="mdi-delete"
            @click:close="removeTaint(t)"
          >
            <v-icon small left> mdi-asterisk </v-icon>
            <span class="mr-2">
              <strong class="mx-1"> key </strong>
              {{ t.key }}
            </span>
            <span class="mr-2">
              <strong class="mx-1"> value </strong>
              {{ t.value }}
            </span>
            <span class="mr-2">
              <strong class="mx-1"> effect </strong>
              {{ t.effect }}
            </span>
          </v-chip>
          <div class="kubegems__clear-float" />
        </v-sheet>
      </v-flex>

      <AddTaint ref="addTaint" @refresh="refreshTaint" />
    </v-card-text>
  </v-card>
</template>
<script>
  import { mapGetters } from 'vuex';
  import AddTaint from './AddTaint';
  import { patchTaintNode, getNodeDetail } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'Taint',
    components: {
      AddTaint,
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
        taint: {
          spec: {
            taints: [],
          },
        },
      };
    },
    computed: {
      ...mapGetters(['Cluster']),
    },
    watch: {
      item() {
        this.taint = deepCopy(this.item);
        if (!this.taint.spec.taints) this.taint.spec.taints = [];
      },
    },
    mounted() {
      this.nodeDetail();
    },
    methods: {
      removeTaint(item) {
        this.$store.commit('SET_CONFIRM', {
          title: '删除污点',
          content: {
            text: `删除污点 ${item.key}`,
            type: 'delete',
            name: item.key,
          },
          param: { item },
          doFunc: async (param) => {
            const taints = this.taint.spec.taints.filter((t) => {
              return !(t.key === param.item.key && t.value === param.item.value);
            });
            await patchTaintNode(this.ThisCluster, this.item.metadata.name, {
              Taints: taints,
            });
            this.nodeDetail();
          },
        });
      },
      addTaint() {
        this.$refs.addTaint.setItem(this.item);
        this.$refs.addTaint.open();
      },
      refreshTaint() {
        this.nodeDetail();
      },
      async nodeDetail() {
        const data = await getNodeDetail(this.ThisCluster, this.$route.params.name, {
          noprocessing: true,
        });
        this.taint = data;
      },
    },
  };
</script>
