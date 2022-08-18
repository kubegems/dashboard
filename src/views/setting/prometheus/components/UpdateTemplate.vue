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
    :title="$root.$t('operate.update_c', [$root.$t('resource.template')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :edit="true"
        :item="item"
        title="Reocrding Rules"
        :units="units"
      />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateTemplate">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import TemplateBaseForm from './TemplateBaseForm';
  import { getRuleDetail, putUpdateRule } from '@/api';

  export default {
    name: 'UpdateTemplate',
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
      formComponent: 'TemplateBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['Tenant']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateTemplate() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'TemplateBaseForm') {
            data = this.$refs[this.formComponent].getData();

            await putUpdateRule(this.Tenant().ID, data.id, data);
          }
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        const data = await getRuleDetail(this.Tenant().ID, item.id);
        this.item = data;
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
