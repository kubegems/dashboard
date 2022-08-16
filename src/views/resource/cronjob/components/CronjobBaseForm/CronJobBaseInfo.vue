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
    <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.cronjob')])" />
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
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.schedule"
            class="my-0"
            :label="$t('tip.crontab')"
            required
            :rules="objRules.scheduleRule"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <BaseSubTitle :title="$t('tip.cronjob_setting')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.backoffLimit"
            class="my-0"
            :label="$t('tip.max_retry')"
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
            :label="$t('tip.parallisem')"
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
          <v-text-field
            v-model="obj.spec.startingDeadlineSeconds"
            class="my-0"
            :label="$t('tip.start_seconds')"
            required
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.successfulJobsHistoryLimit"
            class="my-0"
            :label="$t('tip.success_job_limit')"
            required
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.spec.failedJobsHistoryLimit"
            class="my-0"
            :label="$t('tip.failed_job_limit')"
            required
            type="number"
          />
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.spec.concurrencyPolicy"
            class="my-0"
            color="primary"
            hide-selected
            :items="concurrencyPolicys"
            :label="$t('tip.parallisem_policy')"
            :no-data-text="$root.$t('data.no_data')"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.spec.jobTemplate.spec.template.spec.restartPolicy"
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
    name: 'BaseInfo',
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
        default: () => 'CronJob',
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
        concurrencyPolicys: [
          { text: 'Allow', value: 'Allow' },
          { text: 'Forbid', value: 'Forbid' },
          { text: 'Replace', value: 'Replace' },
        ],
        obj: {
          apiVersion: 'batch/v1beta1',
          kind: 'CronJob',
          metadata: {
            name: '',
            namespace: null,
          },
          spec: {
            schedule: '',
            parallelism: 0,
            completions: 0,
            backoffLimit: 0,
            activeDeadlineSeconds: 0,
            startingDeadlineSeconds: 0,
            successfulJobsHistoryLimit: 0,
            failedJobsHistoryLimit: 0,
            concurrencyPolicy: 'Forbid',
            jobTemplate: {
              spec: {
                template: {
                  spec: {
                    restartPolicy: 'Never',
                  },
                },
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
          scheduleRule: [required],
          kindRule: [required],
        };
      },
      restartPolicys() {
        return [
          { text: this.$t('tip.never'), value: 'Never' },
          {
            text: this.$t('tip.onfailure'),
            value: 'OnFailure',
          },
        ];
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['cronjob'] || 'batch/v1beta1';
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
          this.obj.spec.jobTemplate.spec.template.spec.nodeSelector = {};
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
      onKindChange() {
        this.$emit('change', this.resourceKind);
      },
      onNamespaceSelectFocus(clusterName) {
        this.m_select_namespaceSelectData(clusterName);
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      checkSaved() {
        if (Object.prototype.hasOwnProperty.call(this, 'expand')) {
          return !this.expand;
        }
        return true;
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
