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
          <v-btn v-if="m_permisson_resourceAllow" class="primary--text" small text @click="scalePersistentVolumeClaim">
            <v-icon left small> mdi-arrow-up-down-bold </v-icon>
            {{ $t('operate.scale_pvc') }}
          </v-btn>
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
              <v-card-text class="pa-2 text-center">
                <v-flex>
                  <v-btn color="primary" small text @click="updatePersistentVolumeClaim">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex
                  v-if="
                    pvc &&
                    pvc.metadata.annotations &&
                    pvc.metadata.annotations['storage.kubegems.io/allow-snapshot'] &&
                    pvc.metadata.annotations['storage.kubegems.io/allow-snapshot'] === 'true'
                  "
                >
                  <v-btn color="primary" small text @click="addVolumeSnapshot">
                    {{ $t('operate.create_snapshot') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removePersistentVolumeClaim">
                    {{ $root.$t('operate.delete') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="pvc" />
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card>
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
          :item="pvc"
          :selector="{
            topkind: 'PersistentVolumeClaim',
            topname: pvc ? pvc.metadata.name : '',
          }"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="pvc" />
    <UpdatePersistentVolumeClaim ref="updatePersistentVolumeClaim" @refresh="persistentVolumeClaimDetail" />
    <ScalePersistentVolumeClaim ref="scalePersistentVolumeClaim" @refresh="persistentVolumeClaimDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import PersistentVolumeClaimMonitor from './components/PersistentVolumeClaimMonitor';
  import ResourceInfo from './components/ResourceInfo';
  import ScalePersistentVolumeClaim from './components/ScalePersistentVolumeClaim';
  import UpdatePersistentVolumeClaim from './components/UpdatePersistentVolumeClaim';
  import messages from './i18n';
  import { deletePersistentVolumeClaim, getPersistentVolumeClaimDetail, postAddVolumeSnapshot } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import EventList from '@/views/resource/components/common/EventList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'PersistentVolumeClaimDetail',
    i18n: {
      messages: messages,
    },
    components: {
      BasicResourceInfo,
      EventList,
      Metadata,
      PersistentVolumeClaimMonitor,
      ResourceInfo,
      ResourceYaml,
      ScalePersistentVolumeClaim,
      UpdatePersistentVolumeClaim,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      pvc: null,
      tab: 0,
    }),
    computed: {
      ...mapState(['JWT']),
      tabItems() {
        return [
          { text: this.$root.$t('tab.resource_info'), value: 'ResourceInfo' },
          { text: this.$root.$t('tab.metadata'), value: 'Metadata' },
          { text: this.$root.$t('tab.event'), value: 'EventList' },
          { text: this.$root.$t('tab.monitor'), value: 'PersistentVolumeClaimMonitor' },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.persistentVolumeClaimDetail();
        });
      }
    },
    methods: {
      async persistentVolumeClaimDetail() {
        const data = await getPersistentVolumeClaimDetail(
          this.ThisCluster,
          this.$route.query.namespace,
          this.$route.params.name,
        );
        this.pvc = data;
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updatePersistentVolumeClaim() {
        this.$refs.updatePersistentVolumeClaim.init(this.pvc);
        this.$refs.updatePersistentVolumeClaim.open();
      },
      addVolumeSnapshot() {
        const item = this.pvc;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.persistentvolumeclaim')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.persistentvolumeclaim')])} ${
              item.metadata.name
            }`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await postAddVolumeSnapshot(this.ThisCluster, param.item.metadata.namespace, {
                persistentVolumeClaimName: param.item.metadata.name,
              });
            }
          },
        });
      },
      scalePersistentVolumeClaim() {
        this.$refs.scalePersistentVolumeClaim.init(this.pvc);
        this.$refs.scalePersistentVolumeClaim.open();
      },
      removePersistentVolumeClaim() {
        const item = this.pvc;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.persistentvolumeclaim')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.persistentvolumeclaim')])} ${
              item.metadata.name
            }`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deletePersistentVolumeClaim(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({ name: 'persistentvolumeclaim-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
