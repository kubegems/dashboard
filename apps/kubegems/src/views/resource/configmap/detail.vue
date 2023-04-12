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
    <BaseMicroServiceHeader v-if="module === 'microservice'" :selectable="false" />
    <BaseViewportHeader v-else :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" small text @click="resourceYaml">
            <v-icon left small> mdi-code-json </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow()" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateConfigMap"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeConfigMap"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="my-0">
      <v-col class="py-0" cols="2">
        <BasicResourceInfo :item="configmap" />
      </v-col>
      <v-col class="py-0" cols="10">
        <v-card v-for="(data, key) in configmap ? configmap.data : {}" :key="key" class="mb-3" flat>
          <v-card-text class="pa-4">
            <BaseSubTitle color="primary" :divider="false" :title="key">
              <template #action>
                <v-btn v-clipboard:copy="configmap.data[key]" v-clipboard:success="copyed" color="white" icon small>
                  <v-icon small> mdi-content-copy</v-icon>
                </v-btn>
              </template>
            </BaseSubTitle>
            <div :style="{ maxHeight: `${height}px`, overflowY: 'auto' }">
              <pre class="kubegems__data-pre rounded">{{ configmap.data[key] }}</pre>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="configmap" />
    <UpdateConfigMap ref="updateConfigMap" @refresh="configMapDetail" />
  </v-container>
</template>

<script>
  import { deleteConfigMap, getConfigMapDetail } from '@kubegems/api/direct';
  import BaseFilter from '@kubegems/mixins/base_filter';
  import BasePermission from '@kubegems/mixins/permission';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapGetters, mapState } from 'vuex';

  import UpdateConfigMap from './components/UpdateConfigMap';
  import messages from './i18n';
  import BasicResourceInfo from '@kubegems/components/logicComponents/BasicResourceInfo';
  import ResourceYaml from '@kubegems/components/logicComponents/ResourceYaml';

  export default {
    name: 'ConfigMapDetail',
    i18n: {
      messages: messages,
    },
    components: {
      BasicResourceInfo,
      ResourceYaml,
      UpdateConfigMap,
    },
    mixins: [BaseFilter, BasePermission, BaseResource],
    data() {
      return {
        configmap: null,
      };
    },
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['VirtualSpace']),
      module() {
        return window.location.href.match(new RegExp('\\/(\\w+)\\/'))[1];
      },
      height() {
        return parseInt((window.innerHeight - 276) / this.Scale);
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.configMapDetail();
      });
    },
    methods: {
      async configMapDetail() {
        const data = await getConfigMapDetail(
          this.$route.query.cluster || this.ThisCluster,
          this.$route.query.namespace,
          this.$route.params.name,
        );
        this.configmap = data;
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateConfigMap() {
        this.$refs.updateConfigMap.init(this.configmap);
        this.$refs.updateConfigMap.open();
      },
      removeConfigMap() {
        const item = this.configmap;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.configmap')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.configmap')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteConfigMap(
              this.$route.query.cluster || this.ThisCluster,
              this.$route.query.namespace,
              param.item.metadata.name,
            );
            if (this.VirtualSpace().ID > 0) {
              this.$router.push({ name: 'microconfigmap-list', params: this.$route.params });
            } else {
              this.$router.push({ name: 'configmap-list', params: this.$route.params });
            }
          },
        });
      },
      copyed() {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$t('tip.copyed'),
          color: 'success',
        });
      },
    },
  };
</script>
