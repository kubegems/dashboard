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
  <BaseDialog v-model="dialog" icon="mdi-cogs" :title="$t('operate.auto_scale_policy')" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$t('operate.auto_scale_policy')])">
        <template #action>
          <v-btn v-if="obj.exist" class="float-right mr-2" color="primary" small text @click="removeHPA">
            <v-icon left small> mdi-delete </v-icon>
            {{ $t('operate.clear_c', [$t('operate.auto_scale_policy')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-card-text class="px-2 pb-0">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field v-model="obj.cpu" class="my-0" required :rules="objRules.cpuRules" suffix="%">
              <template #label>
                <div>
                  {{ $t('tip.cpu_max_used') }} <span v-if="obj.exist" class="error--text">({{ getCpuTip() }})</span>
                </div>
              </template>
            </v-text-field>
            <v-text-field v-model="obj.memory" class="my-0" required :rules="objRules.memoryRules" suffix="%">
              <template #label>
                <div>
                  {{ $t('tip.memory_max_used') }}
                  <span v-if="obj.exist" class="error--text">({{ getMemoryTip() }})</span>
                </div>
              </template>
            </v-text-field>
            <v-text-field
              v-model="obj.min_replicas"
              class="my-0"
              :label="$t('tip.min_replicas')"
              required
              :rules="objRules.min_replicasRules"
              type="number"
            />
            <v-text-field
              v-model="obj.max_replicas"
              class="my-0"
              :label="$t('tip.max_replicas')"
              required
              :rules="objRules.max_replicasRules"
              type="number"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="setHPA">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { deleteHpa, getHpaDetail, postSetHpa } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'HPAStrategy',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      kind: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      dialog: false,
      valid: false,
      obj: {
        cluster: '',
        kind: '',
        name: '',
        namespace: '',
        cpu: '',
        max_replicas: 0,
        memory: '',
        min_replicas: 0,
        real_cpu: 0,
        real_memory: 0,
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          cpuRules: [
            (v) => {
              if (v !== '') {
                if (!new RegExp('^\\d+$').test(v)) {
                  return this.$t('form.number_rule');
                } else {
                  if (parseInt(v) < 0) return this.$t('form.limit_min_rule');
                  if (parseInt(v) > 100) return this.$t('form.limit_max_rule');
                  return true;
                }
              } else if (this.obj.cpu === '' && this.obj.memory === '') {
                return this.$t('form.replicas_required_rule');
              }
              return true;
            },
          ],
          memoryRules: [
            (v) => {
              if (v !== '') {
                if (!new RegExp('^\\d+$').test(v)) {
                  return this.$t('form.number_rule');
                } else {
                  if (parseInt(v) < 0) return this.$t('form.limit_min_rule');
                  if (parseInt(v) > 100) return this.$t('form.limit_max_rule');
                  return true;
                }
              } else if (this.obj.cpu === '' && this.obj.memory === '') {
                return this.$t('form.replicas_required_rule');
              }
              return true;
            },
          ],
          min_replicasRules: [(v) => parseInt(v) >= 0 || this.$t('form.limit_min_rule')],
          max_replicasRules: [
            (v) => parseInt(v) >= 0 || this.$t('form.limit_min_rule'),
            (v) => parseInt(this.obj.min_replicas) < parseInt(v) || this.$t('form.min_gte_max_rule'),
          ],
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async setHPA() {
        if (this.$refs.form.validate(true)) {
          this.obj.cpu = this.obj.cpu !== '' ? parseInt(this.obj.cpu) : null;
          this.obj.memory = this.obj.memory !== '' ? parseInt(this.obj.memory) : null;
          this.obj.min_replicas = parseInt(this.obj.min_replicas);
          this.obj.max_replicas = parseInt(this.obj.max_replicas);
          await postSetHpa(this.obj.cluster, this.obj.namespace, this.obj);
          this.reset();
        }
      },
      async hpaDetail() {
        this.obj.cluster = this.ThisCluster;
        this.obj.kind = this.kind !== '' ? this.kind : this.$route.query.type;
        this.obj.name = this.item.metadata.name;
        this.obj.namespace = this.item.metadata.namespace;
        const data = await getHpaDetail(this.obj.cluster, this.obj.namespace, this.obj);
        if (data.exist) {
          this.obj = data;
          if (this.obj.cpu === 0) this.obj.cpu = '';
          if (this.obj.memory === 0) this.obj.memory = '';
        } else {
          this.obj.min_replicas = 0;
          this.obj.max_replicas = 0;
          this.$refs.form.resetValidation();
        }
      },
      async init() {
        await this.hpaDetail();
      },
      async removeHPA() {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.clear_c', [this.$t('operate.auto_scale_policy')]),
          content: { text: this.$t('operate.clear_c', [this.$t('operate.auto_scale_policy')]), type: 'confirm' },
          param: {},
          doFunc: async () => {
            if (this.obj.name.length > 0) {
              await deleteHpa(
                this.ThisCluster,
                this.obj.namespace,
                `hpa-${
                  this.kind !== ''
                    ? this.kind === 'Deployment'
                      ? 'dep'
                      : 'sts'
                    : this.$route.query.type === 'Deployment'
                    ? 'dep'
                    : 'sts'
                }-${this.obj.name}`,
              );
            }
            this.reset();
          },
        });
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
      getCpuTip() {
        if (this.obj.real_cpu === 0) {
          return this.$t('tip.not_effect');
        }
        if (parseFloat(this.obj.real_cpu) !== parseFloat(this.obj.cpu)) {
          return this.$t('tip.changed_resource_limit', [this.obj.real_cpu]);
        }
      },
      getMemoryTip() {
        if (this.obj.real_memory === 0) {
          return this.$t('tip.not_effect');
        }
        if (parseFloat(this.obj.real_memory) !== parseFloat(this.obj.memory)) {
          return this.$t('tip.changed_resource_limit', [this.obj.real_memory]);
        }
      },
    },
  };
</script>
