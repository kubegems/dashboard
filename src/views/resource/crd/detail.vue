<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" small text @click="resourceYaml">
            <v-icon left small> mdi-code-json </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="error" small text @click="removeCRD"> {{ $root.$t('operate.delete') }} </v-btn>
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
  import messages from './i18n';
  import { deleteCRD, getCrdDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'CRDDetail',
    i18n: {
      messages: messages,
    },
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
    }),
    computed: {
      ...mapState(['JWT']),
      tabItems() {
        return [
          { text: this.$root.$t('tab.resource_info'), value: 'ResourceInfo' },
          { text: this.$root.$t('tab.metadata'), value: 'Metadata' },
          { text: this.$t('tab.cr_list'), value: 'CRList' },
        ];
      },
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
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.crd')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.crd')])} ${item.metadata.name}`,
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
