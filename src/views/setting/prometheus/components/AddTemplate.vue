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
    icon="mdi-file-powerpoint-box"
    title="创建 Prometheus 查询模版"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" :item="item" title="Reocrding Rules" :units="units" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addTemplate"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import TemplateBaseForm from './TemplateBaseForm';
  import { postPrometheusTemplate } from '@/api';

  export default {
    name: 'AddTemplate',
    components: {
      TemplateBaseForm,
    },
    props: {
      units: {
        type: Array,
        default: () => [],
      },
    },
    data: () => ({
      dialog: false,
      yaml: null,
      item: null,
      resourceName: null,
      formComponent: 'TemplateBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addTemplate() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'TemplateBaseForm') {
            data = this.$refs[this.formComponent].getData();
            const ruleName = data.name;
            delete data.name;
            await postPrometheusTemplate(this.resourceName, ruleName, data);
          }
          this.reset();
          this.$emit('refresh');
        }
      },
      init(resourceName) {
        this.resourceName = resourceName;
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'TemplateBaseForm';
        this.yaml = false;
      },
    },
  };
</script>
