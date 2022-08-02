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
  <BaseDialog v-model="dialog" icon="mdi-send" title="滚动更新部署" :width="1000" @reset="reset">
    <template #content>
      <v-flex>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <BaseDeployInfoForm ref="baseDeployInfoForm" :runtime="runtime" />

          <BaseSubTitle title="滚动更新策略" />
          <v-card-text class="pa-2">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="obj.strategy.rolling.maxUnavailable"
                  class="my-0"
                  label="容器组最大不可用数量"
                  required
                  :rules="rollingUpdateRules.maxUnavailableRules"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="obj.strategy.rolling.maxSurge"
                  class="my-0"
                  label="容器组最大超出数量"
                  required
                  :rules="rollingUpdateRules.maxSurgeRules"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-form>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="strategyDeployEnvironmentApps">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import BaseDeployInfoForm from './base/BaseDeployInfoForm';
  import { postStrategyDeployEnvironmentApps } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';
  import StrategyDeploy from '@/views/resource/deploy/mixins/deploy';

  export default {
    name: 'RollingUpdate',
    components: {
      BaseDeployInfoForm,
    },
    mixins: [StrategyDeploy],
    data() {
      return {
        dialog: false,
        valid: false,
        obj: {
          images: [],
          name: '',
          strategy: {
            rolling: {
              maxSurge: '25%',
              maxUnavailable: '25%',
            },
            type: 'RollingUpdate',
          },
          istioVersion: '',
        },
        rollingUpdateRules: {
          maxUnavailableRules: [required],
          maxSurgeRules: [required],
        },
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init() {
        await this.strategyDeployEnvironmentAppsDetail();
        if (this.runtime.strategy.type === 'RollingUpdate') {
          this.obj = deepCopy(this.runtime);
        }
      },
      async strategyDeployEnvironmentApps() {
        if (this.$refs.baseDeployInfoForm.validate() && this.$refs.form.validate(true)) {
          this.obj = Object.assign(this.obj, this.$refs.baseDeployInfoForm.getData());
          await postStrategyDeployEnvironmentApps(
            this.Tenant().ID,
            this.Project().ID,
            this.Environment().ID,
            this.$route.params.name,
            this.obj,
          );
          this.reset();
          // this.$emit('refresh')
          this.dialog = false;
          this.$router.push({
            name: 'app-detail',
            params: { name: this.$route.params.name },
            query: {
              projectid: this.Project().ID,
              tenantid: this.Tenant().ID,
              kind: 'app',
              namespace: this.Environment().Namespace,
              type: this.$route.query.type,
              tab: 1,
            },
          });
        }
      },
      reset() {
        this.obj = deepCopy(this.$options.data().obj);
        this.$refs.form.resetValidation();
        this.$refs.baseDeployInfoForm.reset();
      },
    },
  };
</script>
