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
    icon="mdi-cube"
    :title="$root.$t('operate.update_c', [$t('tip.model_instance')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <BaseYamlForm ref="yamlForm" :item="item" :title="item ? item.kind : ''" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateModelRuntime">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
    <template #header-action>
      <div class="text-h6 ml-2 white--text mt-1">Yaml</div>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getModelRuntimeDetail, putModelRuntime } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'UpdateModelRuntime',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      item: null,
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['Tenant', 'Project', 'Environment']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateModelRuntime() {
        if (this.$refs.yamlForm.validate()) {
          let data = this.$refs.yamlForm.getYaml();
          data = this.$yamlload(data);
          const namespace = this.ThisNamespace;
          if (!this.m_resource_checkDataWithNS(data, namespace)) {
            return;
          }
          data = this.m_resource_beautifyData(data);
          await putModelRuntime(
            this.Tenant().TenantName,
            this.Project().ProjectName,
            this.Environment().EnvironmentName,
            this.item.metadata.name,
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        const data = await getModelRuntimeDetail(
          this.Tenant().TenantName,
          this.Project().ProjectName,
          this.Environment().EnvironmentName,
          item.metadata.name,
        );
        this.item = data;
      },
      reset() {
        this.dialog = false;
        this.$refs.yamlForm.reset();
      },
    },
  };
</script>
