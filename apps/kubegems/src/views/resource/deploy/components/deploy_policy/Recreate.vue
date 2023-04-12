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
  <BaseDialog v-model="dialog" icon="mdi-send" :title="$t('tip.recreate')" :width="1000" @reset="reset">
    <template #content>
      <v-flex>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <BaseDeployInfoForm ref="baseDeployInfoForm" :runtime="runtime" />
        </v-form>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="strategyDeployEnvironmentApps">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { getStrategyDeployEnvironmentAppsDetail, postStrategyDeployEnvironmentApps } from '@kubegems/api/direct';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import BaseDeployInfoForm from './base/BaseDeployInfoForm';

  export default {
    name: 'Recreate',
    i18n: {
      messages: messages,
    },
    components: {
      BaseDeployInfoForm,
    },
    data() {
      return {
        dialog: false,
        valid: false,
        obj: {
          images: [],
          name: '',
          strategy: {
            recreate: {
              waitShutDown: true,
            },
            type: 'Recreate',
          },
          istioVersion: '',
        },
        runtime: {},
      };
    },
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['Tenant', 'Project', 'Environment']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init() {
        await this.strategyDeployEnvironmentAppsDetail();
        if (this.runtime.strategy.type === 'Recreate') {
          this.obj = deepCopy(this.runtime);
        }
      },
      async strategyDeployEnvironmentAppsDetail() {
        const data = await getStrategyDeployEnvironmentAppsDetail(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
        );
        this.runtime = data;
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
