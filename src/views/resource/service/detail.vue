<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" small text @click="resourceYaml">
            <v-icon left small> fas fa-code </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateService"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeService"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="service" />
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card flat>
          <v-card-text class="pa-0">
            <template v-if="service">
              <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
                <v-tab v-for="item in tabItems" :key="item.value">
                  {{ item.text }}
                </v-tab>
              </v-tabs>
            </template>
          </v-card-text>
        </v-card>

        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :item="service"
          :selector="selector"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="service" />
    <UpdateService ref="updateService" @refresh="serviceDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import ResourceInfo from './components/ResourceInfo';
  import UpdateService from './components/UpdateService';
  import { getServiceDetail, deleteService } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import EventList from '@/views/resource/components/common/EventList';
  import PodList from '@/views/resource/components/common/PodList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'ServiceDetail',
    components: {
      BasicResourceInfo,
      EventList,
      Metadata,
      PodList,
      ResourceInfo,
      ResourceYaml,
      UpdateService,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      service: null,
      tab: 0,
    }),
    computed: {
      ...mapState(['JWT']),
      selector() {
        if (this.tabItems[this.tab].value === 'PodList') {
          if (this.service) {
            const selector = {};
            for (const key in this.service.spec.selector) {
              selector[`labels[${key}]`] = this.service.spec.selector[key];
            }
            return selector;
          }
        } else if (this.tabItems[this.tab].value === 'EventList') {
          return {
            topkind: 'Service',
            topname: this.service ? this.service.metadata.name : '',
          };
        }
        return {};
      },
      tabItems() {
        const items = [
          { text: '资源信息', value: 'ResourceInfo' },
          { text: '元数据', value: 'Metadata' },
          { text: '事件', value: 'EventList' },
        ];
        if (this.service && this.service.spec.type !== 'ExternalName') {
          items.splice(2, 0, { text: '容器组', value: 'PodList' });
        }
        return items;
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.serviceDetail();
        });
      }
    },
    methods: {
      async serviceDetail() {
        const data = await getServiceDetail(this.ThisCluster, this.$route.query.namespace, this.$route.params.name);
        this.service = data;
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateService() {
        this.$refs.updateService.init(this.service);
        this.$refs.updateService.open();
      },
      removeService() {
        const item = this.service;
        this.$store.commit('SET_CONFIRM', {
          title: `删除服务`,
          content: {
            text: `删除服务 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteService(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({ name: 'service-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
