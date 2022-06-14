<template>
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" small text @click="resourceYaml">
            <v-icon left small> fas fa-code </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow($route.query.env)" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateFlow"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeFlow"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row v-if="flow" class="mt-0">
      <!-- 基本信息 -->
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="flow" />
      </v-col>
      <!-- 基本信息 -->

      <!-- 配置 -->
      <v-col class="pt-0" cols="10">
        <v-card>
          <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
            <v-tab v-for="item in tabItems" :key="item.value">
              {{ item.text }}
            </v-tab>
          </v-tabs>
        </v-card>
        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" :item="flow" />
      </v-col>
      <!-- 配置 -->
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="flow" />

    <UpdateFlow ref="updateFlow" @refresh="getFlowDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import ResourceInfo from './components/ResourceInfo';
  import UpdateFlow from './components/UpdateFlow';

  import { getFlowDetailData, getClusterFlowDetailData, deleteClusterFlowData, deleteFlowData } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'FlowDetail',
    components: {
      BasicResourceInfo,
      Metadata,
      ResourceInfo,
      ResourceYaml,
      UpdateFlow,
    },
    mixins: [BasePermission],
    data() {
      this.tabItems = [
        { text: '资源信息', value: 'ResourceInfo' },
        { text: '元数据', value: 'Metadata' },
      ];

      return {
        flow: null,
        tab: 0,
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
    },
    mounted() {
      this.getFlowDetail();
    },
    methods: {
      async getFlowDetail() {
        const { cluster, namespace } = this.$route.query;
        const { name, kind } = this.$route.params;
        const action = kind === 'Flow' ? getFlowDetailData : getClusterFlowDetailData;
        this.flow = await action(cluster, namespace, name);
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateFlow() {
        this.$refs.updateFlow.init(this.flow);
        this.$refs.updateFlow.open();
      },
      removeFlow() {
        const item = this.flow;
        this.$store.commit('SET_CONFIRM', {
          title: `删除日志采集器`,
          content: {
            text: `删除日志采集器 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            const action = item.kind === 'Flow' ? deleteFlowData : deleteClusterFlowData;
            await action(this.$route.query.cluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({
              name: this.AdminViewport ? 'admin-log-config' : 'log-config',
              params: this.$route.params,
              query: {
                cluster: this.$route.query.cluster,
                namespace: this.$route.query.namespace,
                proj: this.$route.query.proj,
                env: this.$route.query.env,
                tab: 'flow',
              },
            });
          },
        });
      },
    },
  };
</script>
