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
                  <v-btn color="error" small text @click="removeCRD"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :environment="false" :item="crd" :project="false" />
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
          :item="crd"
          :selector="{
            topkind: 'CustomResourceDefinition',
            topname: crd ? crd.metadata.name : '',
          }"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="crd" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import CRList from './components/CRList';
  import ResourceInfo from './components/ResourceInfo';
  import { getCrdDetail, deleteCRD } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'CRDDetail',
    components: {
      BasicResourceInfo,
      CRList,
      Metadata,
      ResourceInfo,
      ResourceYaml,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      crd: null,
      tab: 0,
      tabItems: [
        { text: '资源信息', value: 'ResourceInfo' },
        { text: '元数据', value: 'Metadata' },
        { text: '资源列表', value: 'CRList' },
      ],
    }),
    computed: {
      ...mapState(['JWT']),
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.crdDetail();
        });
      }
    },
    methods: {
      async crdDetail() {
        const data = await getCrdDetail(this.ThisCluster, this.$route.params.name);
        this.crd = data;
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      removeCRD() {
        const item = this.crd;
        this.$store.commit('SET_CONFIRM', {
          title: `删除CRD`,
          content: {
            text: `删除CRD ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteCRD(this.ThisCluster, param.item.metadata.name);
            this.$router.push({ name: 'crd-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
