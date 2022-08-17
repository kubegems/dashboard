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
    <BaseSubTitle :title="$t('tip.update_policy')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="strategy"
            class="my-0"
            color="primary"
            hide-selected
            :items="updateStrategys"
            :label="$t('tip.update_type')"
            :no-data-text="$root.$t('data.no_data')"
            :rules="dataRules.updateStrategyRule"
            @change="onUpdateStrategyDataInput"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <template v-if="kind === 'DaemonSet'">
          <v-col v-if="obj.spec.updateStrategy && obj.spec.updateStrategy.type === 'RollingUpdate'" cols="6">
            <v-text-field
              v-model="data.maxUnavailable"
              class="my-0"
              :label="$t('tip.max_unavailable')"
              required
              :rules="dataRules.maxUnavailableRule"
              @keyup="onUpdateStrategyDataInput"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="data.minReadySeconds"
              class="my-0"
              :label="$t('tip.min_ready_seconds')"
              required
              type="number"
              @keyup="onUpdateStrategyDataInput"
            />
          </v-col>
        </template>

        <template v-else-if="kind === 'Deployment'">
          <v-col v-if="obj.spec.strategy && obj.spec.strategy.type === 'RollingUpdate'" cols="6">
            <v-text-field
              v-model="data.maxUnavailable"
              class="my-0"
              :label="$t('tip.max_unavailable')"
              required
              :rules="dataRules.maxUnavailableRule"
              @keyup="onUpdateStrategyDataInput"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="data.maxSurge"
              class="my-0"
              :label="$t('tip.max_exceed')"
              required
              :rules="dataRules.maxSurgeRule"
              @keyup="onUpdateStrategyDataInput"
            />
          </v-col>
        </template>

        <template v-else-if="kind === 'StatefulSet'">
          <v-col v-if="obj.spec.updateStrategy && obj.spec.updateStrategy.type === 'RollingUpdate'" cols="6">
            <v-text-field
              v-model="data.partition"
              class="my-0"
              label="Partition"
              required
              :rules="dataRules.partitionRule"
              @keyup="onUpdateStrategyDataInput"
            />
          </v-col>
        </template>
      </v-row>
    </v-card-text>

    <BaseSubTitle :title="$t('tip.deploy_type')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="affinity"
            class="my-0"
            color="primary"
            hide-selected
            :items="affinitys"
            :label="$t('tip.deploy_type')"
            :no-data-text="$root.$t('data.no_data')"
            :rules="dataRules.affinityRule"
            @change="onAffinityChange"
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
  import messages from '../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger, required } from '@/utils/rules';

  export default {
    name: 'DeployPolicy',
    i18n: {
      messages: messages,
    },
    props: {
      kind: {
        type: String,
        default: () => '',
      },
    },
    data() {
      return {
        valid: false,
        affinity: 'normal',
        affinityPolicy: {
          preferredDuringSchedulingIgnoredDuringExecution: [
            {
              weight: 100,
              podAffinityTerm: {
                labelSelector: {
                  matchLabels: {},
                },
                topologyKey: 'kubernetes.io/hostname',
              },
            },
          ],
        },
        obj: {
          spec: {
            selector: {},
            template: {
              spec: {
                affinity: null,
              },
            },
          },
        },
        data: {
          partition: 0,
          maxUnavailable: '25%',
          maxSurge: '25%',
          minReadySeconds: 0,
        },
        strategy: 'RollingUpdate',
        dataRules: {
          affinityRule: [required],
          updateStrategyRule: [required],
          maxUnavailableRule: [required],
          maxSurgeRule: [required],
          partitionRule: [positiveInteger],
        },
      };
    },
    computed: {
      updateStrategys() {
        if (this.kind === 'DaemonSet' || this.kind === 'StatefulSet') {
          return [
            { text: this.$t('tip.rolling'), value: 'RollingUpdate' },
            { text: this.$t('tip.ondelete'), value: 'OnDelete' },
          ];
        } else if (this.kind === 'Deployment') {
          return [
            { text: this.$t('tip.rolling'), value: 'RollingUpdate' },
            { text: this.$t('tip.recreate'), value: 'Recreate' },
          ];
        }
        return [];
      },
      affinitys() {
        return [
          { text: this.$t('tip.default_aff'), value: 'normal' },
          {
            text: this.$t('tip.pod_ant_aff'),
            value: 'podAntiAffinity',
          },
          {
            text: this.$t('tip.pod_aff'),
            value: 'podAffinity',
          },
        ];
      },
    },
    methods: {
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = this.$_.merge(deepCopy(data), this.obj);
          this.generateData();
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      onUpdateStrategyDataInput() {
        if (this.kind === 'DaemonSet') {
          if (this.strategy === 'RollingUpdate') {
            this.$set(this.obj.spec, 'updateStrategy', {
              type: 'RollingUpdate',
              rollingUpdate: {
                maxUnavailable: '20%',
              },
            });
            if (!this.obj.spec.minReadySeconds) {
              this.$set(this.obj.spec, 'minReadySeconds', null);
            }
          } else {
            this.$set(this.obj.spec, 'minReadySeconds', 0);
            this.$set(this.obj.spec, 'updateStrategy', {
              type: 'OnDelete',
            });
          }
        } else if (this.kind === 'Deployment') {
          if (this.strategy === 'RollingUpdate') {
            this.$set(this.obj.spec, 'strategy', {
              type: 'RollingUpdate',
              rollingUpdate: {
                maxUnavailable: this.data.maxUnavailable,
                maxSurge: this.data.maxSurge,
              },
            });
          } else {
            this.$set(this.obj.spec, 'strategy', { type: 'Recreate' });
          }
        } else if (this.kind === 'StatefulSet') {
          if (this.strategy === 'RollingUpdate') {
            this.$set(this.obj.spec, 'updateStrategy', {
              type: 'RollingUpdate',
              rollingUpdate: {
                partition: this.data.partition,
              },
            });
          } else {
            this.$set(this.obj.spec, 'updateStrategy', {
              type: 'OnDelete',
            });
          }
        }
      },
      onAffinityChange() {
        if (this.affinity === 'normal') {
          this.$delete(this.obj.spec.template.spec, 'affinity');
        } else {
          this.obj.spec.affinity = {};
          this.affinityPolicy.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.matchLabels = deepCopy(
            this.obj.spec.selector.matchLabels,
          );
          this.$set(this.obj.spec.template.spec.affinity, this.affinity, this.affinityPolicy);
        }
      },
      generateData() {
        if (this.obj.spec.template.spec.affinity) {
          if (this.obj.spec.template.spec.affinity.podAffinity) {
            this.affinity = 'podAffinity';
          } else if (this.obj.spec.template.spec.affinity.podAntiAffinity) {
            this.affinity = 'podAntiAffinity';
          }
        } else {
          this.affinity = 'normal';
        }
        this.onAffinityChange();
        if (this.obj.spec.updateStrategy || this.obj.spec.strategy) {
          if (this.kind === 'DaemonSet') {
            this.strategy = this.obj.spec.updateStrategy.type;
            if (this.strategy === 'RollingUpdate') {
              this.data.maxUnavailable = this.obj.spec.updateStrategy.rollingUpdate.maxUnavailable;
              this.data.minReadySeconds = this.obj.spec.minReadySeconds;
            }
          } else if (this.kind === 'Deployment') {
            this.strategy = this.obj.spec.strategy.type;
            if (this.strategy === 'RollingUpdate') {
              this.data.maxUnavailable = this.obj.spec.strategy.rollingUpdate.maxUnavailable;
              this.data.maxSurge = this.obj.spec.strategy.rollingUpdate.maxSurge;
            }
          } else if (this.kind === 'StatefulSet') {
            this.strategy = this.obj.spec.updateStrategy.type;
            if (this.strategy === 'RollingUpdate') {
              if (this.obj.spec.updateStrategy.rollingUpdate && this.obj.spec.updateStrategy.rollingUpdate.partition) {
                this.data.partition = this.obj.spec.updateStrategy.rollingUpdate.partition;
              }
            }
          }
        }
        this.onUpdateStrategyDataInput();
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
