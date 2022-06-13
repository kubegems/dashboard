<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn text small class="primary--text" @click="resourceYaml">
            <v-icon left small> fas fa-code </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon x-small color="primary" v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="error" text small @click="removeCRD"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col cols="2" class="pt-0">
        <BasicResourceInfo :item="crd" :project="false" :environment="false" />
      </v-col>
      <v-col cols="10" class="pt-0">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" height="30" class="rounded-t pa-3">
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
  import ResourceInfo from './components/ResourceInfo';
  import CRList from './components/CRList';
  import { getCrdDetail, deleteCRD } from '@/api';
  import Metadata from '@/views/resource/components/metadata/Metadata';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import BaseResource from '@/mixins/resource';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'CRDDetail',
    components: {
      ResourceInfo,
      Metadata,
      ResourceYaml,
      BasicResourceInfo,
      CRList,
    },
    mixins: [BaseResource, BasePermission],
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
