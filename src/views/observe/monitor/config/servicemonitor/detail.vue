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
                  <v-btn color="primary" small text @click="updateServiceMonitor"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeServiceMonitor"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="serviceMonitor" />
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :item="serviceMonitor"
          :selector="selector"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="serviceMonitor" />
    <UpdateServiceMonitor ref="updateServiceMonitor" @refresh="serviceMonitorDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import ResourceInfo from './components/ResourceInfo';
  import UpdateServiceMonitor from './components/UpdateServiceMonitor';
  import { getServiceMonitorDetail, deleteServiceMonitor } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import EventList from '@/views/resource/components/common/EventList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'ServiceMonitorDetail',
    components: {
      BasicResourceInfo,
      EventList,
      Metadata,
      ResourceInfo,
      ResourceYaml,
      UpdateServiceMonitor,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      serviceMonitor: null,
      tab: 0,
      tabItems: [
        { text: '资源信息', value: 'ResourceInfo' },
        { text: '元数据', value: 'Metadata' },
        { text: '事件', value: 'EventList' },
      ],
    }),
    computed: {
      ...mapState(['JWT']),
      selector() {
        if (this.tabItems[this.tab].value === 'EventList') {
          return {
            topkind: 'ServiceMonitor',
            topname: this.serviceMonitor ? this.serviceMonitor.metadata.name : '',
          };
        }
        return {};
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.serviceMonitorDetail();
        });
      }
    },
    methods: {
      async serviceMonitorDetail() {
        const data = await getServiceMonitorDetail(
          this.$route.query.cluster,
          this.$route.query.namespace,
          this.$route.params.name,
        );
        this.serviceMonitor = data;
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateServiceMonitor() {
        this.$refs.updateServiceMonitor.init(this.serviceMonitor);
        this.$refs.updateServiceMonitor.open();
      },
      removeServiceMonitor() {
        const item = this.serviceMonitor;
        this.$store.commit('SET_CONFIRM', {
          title: `删除采集器`,
          content: {
            text: `删除采集器 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteServiceMonitor(
              this.$route.query.cluster,
              this.$route.query.namespace,
              param.item.metadata.name,
            );
            this.$router.push({
              name: 'observe-monitor-config',
              params: this.$route.params,
              query: this.$route.query,
            });
          },
        });
      },
    },
  };
</script>
