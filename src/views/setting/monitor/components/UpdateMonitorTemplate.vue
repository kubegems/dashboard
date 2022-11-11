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
    icon="mdi-code-json"
    :title="$t('operate.load_c', [$root.$t('resource.monitor_template')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" :item="item" :title="$root.$t('resource.monitor_template')" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateMonitorDashboardTemplate">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { getMonitorDashboardTemplateDetail, putMonitorDashboardTemplate } from '@/api';

  export default {
    name: 'UpdateMonitorTemplate',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        dialog: false,
        formComponent: 'BaseYamlForm',
        item: null,
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(item) {
        this.monitorDashboardTemplateDetail(item.name);
      },
      async monitorDashboardTemplateDetail(name) {
        const data = await getMonitorDashboardTemplateDetail(name);
        this.item = data;
      },
      async updateMonitorDashboardTemplate() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
          }
          await putMonitorDashboardTemplate(this.item.name, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'BaseYamlForm';
      },
    },
  };
</script>
