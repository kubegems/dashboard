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
                  <v-btn color="primary" small text @click="updateIngress"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeIngress"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="ingress" />
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
          :gateway="gateway"
          :item="ingress"
          :selector="{
            topkind: 'Ingress',
            topname: ingress ? ingress.metadata.name : '',
          }"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="ingress" />
    <UpdateIngress ref="updateIngress" @refresh="ingressDetail" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ResourceInfo from './components/ResourceInfo';
  import UpdateIngress from './components/UpdateIngress';
  import { getIngressDetail, deleteIngress, getGatewayDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import EventList from '@/views/resource/components/common/EventList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'IngressDetail',
    components: {
      BasicResourceInfo,
      EventList,
      Metadata,
      ResourceInfo,
      ResourceYaml,
      UpdateIngress,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      ingress: null,
      gateway: null,
      tab: 0,
      tabItems: [
        { text: '路由信息', value: 'ResourceInfo' },
        { text: '元数据', value: 'Metadata' },
        { text: '事件', value: 'EventList' },
      ],
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Tenant', 'Cluster']),
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.ingressDetail();
        });
      }
    },
    methods: {
      async ingressDetail() {
        const data = await getIngressDetail(this.ThisCluster, this.$route.query.namespace, this.$route.params.name);
        this.ingress = data;
        if (data && data.spec && data.spec.ingressClassName) {
          this.gatewayDetail();
        }
      },
      async gatewayDetail() {
        const ingressClass = this.ingress.spec.ingressClassName;
        const data = await getGatewayDetail(this.Tenant().ID, this.ThisClusterID, ingressClass, {
          ingressClass: ingressClass,
        });
        this.gateway = data;
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateIngress() {
        this.$refs.updateIngress.init(this.ingress);
        this.$refs.updateIngress.open();
      },
      removeIngress() {
        const item = this.ingress;
        this.$store.commit('SET_CONFIRM', {
          title: `删除路由`,
          content: {
            text: `删除路由 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteIngress(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({ name: 'ingress-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
