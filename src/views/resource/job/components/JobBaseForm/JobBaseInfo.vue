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
    <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.job')])" />
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

    <BaseSubTitle :title="$t('tip.job_setting')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.backoffLimit"
            class="my-0"
            :label="$t('tip.max_restart_count')"
            required
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.completions"
            class="my-0"
            :label="$t('tip.complations')"
            required
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.parallelism"
            class="my-0"
            :label="$t('tip.parallelism')"
            required
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.activeDeadlineSeconds"
            class="my-0"
            :label="$t('tip.deadline_seconds')"
            required
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.spec.template.spec.restartPolicy"
            class="my-0"
            color="primary"
            hide-selected
            :items="restartPolicys"
            :label="$t('tip.restart_policy')"
            :no-data-text="$root.$t('data.no_data')"
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
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'JobBaseInfo',
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
        default: () => 'Job',
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
          apiVersion: 'batch/v1',
          kind: 'Job',
          metadata: {
            name: '',
            namespace: null,
          },
          spec: {
            parallelism: 0,
            completions: 0,
            backoffLimit: 0,
            activeDeadlineSeconds: 0,
            template: {
              spec: {
                restartPolicy: 'Never',
              },
              metadata: {
                labels: {},
              },
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
          kindRule: [required],
        };
      },
      restartPolicys() {
        return [
          { text: this.$t('tip.policy_never'), value: 'Never' },
          {
            text: this.$t('tip.policy_onfailure'),
            value: 'OnFailure',
          },
        ];
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['job'] || 'batch/v1';
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
          this.obj.spec.template.spec.nodeSelector = {};
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
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      onKindChange() {
        this.$emit('change', this.resourceKind);
      },
      onNamespaceSelectFocus(clusterName) {
        this.m_select_namespaceSelectData(clusterName);
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
