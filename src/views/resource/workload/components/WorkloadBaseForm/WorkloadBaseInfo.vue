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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.workload')])" />
    <v-card-text class="pa-2">
      <v-row v-if="manifest">
        <v-col cols="6">
          <v-autocomplete
            v-model="resourceKind"
            class="my-0"
            color="primary"
            hide-selected
            :items="kinds"
            :label="$root.$t('resource.kind')"
            :no-data-text="$root.$t('data.no_data')"
            :readonly="edit"
            :rules="objRules.kindRule"
            @change="onKindChange"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.metadata.name"
            class="my-0"
            :label="$t('table.name')"
            :readonly="edit"
            required
            :rules="objRules.nameRule"
            @input="onWorkloadNameInput"
          />
        </v-col>
        <v-col v-if="AdminViewport && !manifest" cols="6">
          <v-autocomplete
            v-model="obj.metadata.namespace"
            class="my-0"
            color="primary"
            hide-selected
            :items="m_select_namespaceItems"
            :label="$root.$t('resource.namespace')"
            :no-data-text="$root.$t('data.no_data')"
            :readonly="edit"
            :rules="objRules.namespaceRule"
            @focus="onNamespaceSelectFocus(ThisCluster)"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>

    <template v-if="kind !== 'DaemonSet'">
      <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.replicas')])" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.replicas"
              class="my-0"
              :label="$t('tip.replicas')"
              required
              :rules="objRules.replicasRule"
              type="number"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </template>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, positiveInteger, required } from '@/utils/rules';

  export default {
    name: 'WorkloadBaseInfo',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      app: {
        type: Object,
        default: () => {},
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
      kind: {
        type: String,
        default: () => '',
      },
      kinds: {
        type: Array,
        default: () => [],
      },
      manifest: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        valid: false,
        resourceKind: '',
        obj: {
          apiVersion: 'apps/v1',
          kind: '',
          metadata: {
            name: '',
            namespace: null,
            labels: {},
          },
          spec: {
            template: {
              metadata: {
                labels: {},
              },
              spec: {
                containers: [],
              },
            },
            selector: {
              matchLabels: {},
            },
          },
        },
      };
    },
    computed: {
      ...mapState(['AdminViewport', 'ApiResources']),
      objRules() {
        return {
          nameRule: [required, k8sName],
          namespaceRule: [required],
          replicasRule: [positiveInteger, (v) => parseInt(v) >= 0 || this.$t('form.replicas_lte_rule')],
          kindRule: [required],
        };
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources[this.$route.query.type?.toLocaleLowerCase()] || 'apps/v1';
          this.loadData();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async loadData() {
        this.$nextTick(() => {
          if (!this.manifest) {
            if (this.AdminViewport) {
              this.m_select_namespaceSelectData(this.ThisCluster);
            } else {
              this.obj.metadata.namespace = this.ThisNamespace;
            }
          } else {
            this.obj.metadata.name = `${this.app.ApplicationName}`;
          }
          this.obj = this.$_.merge(this.obj, deepCopy(this.item));
          this.resourceKind = this.kind;
          this.obj.kind = this.kind;
        });
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = this.$_.merge(this.obj, deepCopy(data));
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      onWorkloadNameInput() {
        this.obj.metadata.labels['app'] = this.obj.metadata.name;
        this.obj.spec.template.metadata.labels['app'] = this.obj.metadata.name;
        this.obj.spec.selector.matchLabels['app'] = this.obj.metadata.name;
      },
      onKindChange() {
        this.$emit('change', this.resourceKind);
      },
      onNamespaceSelectFocus(clusterName) {
        this.m_select_namespaceSelectData(clusterName);
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      checkSaved() {
        if (Object.prototype.hasOwnProperty.call(this, 'expand')) {
          return !this.expand;
        }
        return true;
      },
    },
  };
</script>
