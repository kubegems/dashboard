<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <BaseDialog v-model="dialog" icon="fas fa-cogs" title="弹性伸缩设置" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="弹性伸缩定义">
        <template #action>
          <v-btn
            v-if="obj.cpu > 0 && obj.memory > 0"
            class="float-right mr-2"
            color="primary"
            small
            text
            @click="removeHPAStrategy"
          >
            <v-icon left small> mdi-delete </v-icon>
            清除弹性伸缩策略
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-card-text class="px-2 pb-0">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field v-model="obj.cpu" class="my-0" required :rules="objRules.cpuRules" suffix="%">
              <template #label>
                <div>
                  最大CPU使用率
                  <span v-if="obj.cpu > 0 && obj.memory > 0" class="error--text">({{ getCpuTip() }})</span>
                </div>
              </template>
            </v-text-field>
            <v-text-field v-model="obj.memory" class="my-0" required :rules="objRules.memoryRules" suffix="%">
              <template #label>
                <div>
                  最大内存使用率
                  <span v-if="obj.cpu > 0 && obj.memory > 0" class="error--text">({{ getMemoryTip() }})</span>
                </div>
              </template>
            </v-text-field>
            <v-text-field
              v-model="obj.min_replicas"
              class="my-0"
              label="最小副本数"
              required
              :rules="objRules.minReplicasRules"
              type="number"
            />
            <v-text-field
              v-model="obj.max_replicas"
              class="my-0"
              label="最大副本数"
              required
              :rules="objRules.maxReplicasRules"
              type="number"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn
        class="float-right mx-2"
        color="primary"
        :loading="publishLoading"
        text
        @click="setAppHPAStrategyAndPublish"
      >
        确定并发布
      </v-btn>
      <v-btn class="float-right" color="primary" :loading="loading" text @click="setAppHPAStrategy"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters } from 'vuex';

  import { deleteHPAStrategy, getAppRunningHPA, postAppHPAStrategy, postSyncAppResource } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'HPAStrategy',
    mixins: [BaseResource],
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
      loading: false,
      publishLoading: false,
    }),
    computed: {
      ...mapGetters(['Tenant', 'Project', 'Environment']),
      objRules() {
        return {
          cpuRules: [
            (v) => {
              if (v !== '') {
                if (!new RegExp('^\\d+$').test(v)) {
                  return '数字格式错误';
                } else {
                  if (parseInt(v) < 0) return '小于最小限制';
                  if (parseInt(v) > 100) return '大于最大限制';
                  return true;
                }
              } else if (this.obj.cpu === '' && this.obj.memory === '') {
                return '最大CPU使用率,最大内存使用率必填一项';
              }
              return true;
            },
          ],
          memoryRules: [
            (v) => {
              if (v !== '') {
                if (!new RegExp('^\\d+$').test(v)) {
                  return '数字格式错误';
                } else {
                  if (parseInt(v) < 0) return '小于最小限制';
                  if (parseInt(v) > 100) return '大于最大限制';
                  return true;
                }
              } else if (this.obj.cpu === '' && this.obj.memory === '') {
                return '最大CPU使用率,最大内存使用率必填一项';
              }
              return true;
            },
          ],
          minReplicasRules: [(v) => parseInt(v) >= 0 || '小于最小限制'],
          maxReplicasRules: [
            (v) => parseInt(v) >= 0 || '小于最小限制',
            (v) => parseInt(this.obj.min_replicas) < parseInt(v) || '最小副本数超过最大副本数',
          ],
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async setAppHPAStrategyAndPublish() {
        this.publishLoading = true;
        await this._setAppHPAStrategy();
        await this.syncAppResource();
        this.publishLoading = false;
        this.reset();
      },
      async setAppHPAStrategy() {
        this.loading = true;
        await this._setAppHPAStrategy();
        this.loading = false;
        this.reset();
      },
      async syncAppResource() {
        await postSyncAppResource(this.Tenant().ID, this.Project().ID, this.Environment().ID, this.$route.params.name);
      },
      async _setAppHPAStrategy() {
        if (this.$refs.form.validate(true)) {
          this.obj.cpu = this.obj.cpu !== '' ? parseInt(this.obj.cpu) : null;
          this.obj.memory = this.obj.memory !== '' ? parseInt(this.obj.memory) : null;
          this.obj.min_replicas = parseInt(this.obj.min_replicas);
          this.obj.max_replicas = parseInt(this.obj.max_replicas);
          await postAppHPAStrategy(
            this.Tenant().ID,
            this.Project().ID,
            this.Environment().ID,
            this.$route.params.name,
            this.obj,
          );
          this.reset();
        }
      },
      async appRunningHPA() {
        this.obj.cluster = this.ThisCluster;
        this.obj.kind = this.$route.query.type;
        this.obj.name = this.$route.params.name;
        this.obj.namespace = this.$route.query.namespace;
        const data = await getAppRunningHPA(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
        );
        if (data.cpu > 0 && data.memory) {
          this.obj = Object.assign(this.obj, data);
          if (this.obj.cpu === 0) this.obj.cpu = '';
          if (this.obj.memory === 0) this.obj.memory = '';
        } else {
          this.obj.min_replicas = 0;
          this.obj.max_replicas = 0;
          this.$refs.form.resetValidation();
        }
      },
      async init() {
        await this.appRunningHPA();
      },
      async removeHPAStrategy() {
        this.$store.commit('SET_CONFIRM', {
          title: '清除弹性伸缩策略',
          content: { text: '清除弹性伸缩策略', type: 'confirm' },
          param: {},
          doFunc: async () => {
            if (this.obj.name.length > 0) {
              await deleteHPAStrategy(
                this.Tenant().ID,
                this.Project().ID,
                this.Environment().ID,
                this.$route.params.name,
              );
            }
            this.reset();
          },
        });
      },
      reset() {
        this.dialog = false;
        this.obj = this.$options.data().obj;
        this.$refs.form.resetValidation();
      },
      getCpuTip() {
        if (this.obj.real_cpu === 0) {
          return `未设置资源的resources,该设置无法生效`;
        }
        if (parseFloat(this.obj.real_cpu) !== parseFloat(this.obj.cpu)) {
          return `用户更改过资源的resources,真实值为${this.obj.real_cpu}%,请重新提交数据`;
        }
      },
      getMemoryTip() {
        if (this.obj.real_memory === 0) {
          return `未设置资源的resources,该设置无法生效`;
        }
        if (parseFloat(this.obj.real_memory) !== parseFloat(this.obj.memory)) {
          return `用户更改过资源的resources,真实值为${this.obj.real_memory}%,请重新提交数据`;
        }
      },
    },
  };
</script>
