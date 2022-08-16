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
  <BaseDialog
    v-model="dialog"
    icon="mdi-arrow-up-down-bold"
    :title="$t('operate.scale_replicas')"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.replicas')])" />
      <v-card-text class="px-2 pb-0">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-flex class="text-subtitle-1 mb-2">
              {{ $t('tip.now_replicas') }}
              <span class="text-subtitle-2 primary--text">
                {{ replicas }}
              </span>
            </v-flex>
            <v-text-field
              v-model.number="obj.replicas"
              class="my-0"
              :label="$t('tip.dest_replicas')"
              required
              :rules="objRules.replicasRules"
              type="number"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="scaleAppReplicas">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getAppRunningReplicas, getModelRuntimeDetail, postAppReplicasScale, putModelRuntime } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ScaleReplicas',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      valid: false,
      item: null,
      obj: {
        replicas: 0,
      },
      replicas: 0,
      objRules: {
        replicasRules: [(v) => parseInt(v) >= 0 || this.$t('form.limit_min_rule')],
      },
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['Tenant', 'Project', 'Environment']),
    },
    methods: {
      init(kind) {
        if (kind === 'modelstore') {
          this.modelRuntimeDetail();
        } else {
          this.appRunningReplicas();
        }
      },
      open() {
        this.dialog = true;
      },
      async modelRuntimeDetail() {
        const data = await getModelRuntimeDetail(
          this.Tenant().TenantName,
          this.Project().ProjectName,
          this.Environment().EnvironmentName,
          this.$route.params.name,
        );
        this.replicas = data.spec.replicas;
        this.obj.replicas = data.spec.replicas;
        this.item = data;
      },
      async appRunningReplicas() {
        const data = await getAppRunningReplicas(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
        );
        this.replicas = data.replicas;
        this.obj.replicas = data.replicas;
      },
      async scaleAppReplicas() {
        if (this.$refs.form.validate(true)) {
          if (this.item.kind === 'ModelDeployment') {
            const data = deepCopy(this.item);
            data.spec.replicas = this.obj.replicas;
            await putModelRuntime(
              this.Tenant().TenantName,
              this.Project().ProjectName,
              this.Environment().EnvironmentName,
              this.$route.params.name,
              data,
            );
          } else {
            await postAppReplicasScale(
              this.Tenant().ID,
              this.Project().ID,
              this.Environment().ID,
              this.$route.params.name,
              {},
              {
                replicas: parseInt(this.obj.replicas),
              },
            );
          }
          this.$emit('refresh');
          this.reset();
        }
      },
      reset() {
        this.dialog = false;
        this.obj = this.$options.data().obj;
        this.$refs.form.resetValidation();
      },
    },
  };
</script>
