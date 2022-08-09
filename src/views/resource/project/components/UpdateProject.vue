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
    icon="mdi-cube-outline"
    :title="$t('operate.update_c', [$t('resource.project')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" :step="step" />
    </template>
    <template #action>
      <v-btn v-if="step === 1" class="float-right mx-2" color="primary" :loading="Circular" text @click="updateProject">
        {{ $t('operate.confirm') }}
      </v-btn>
      <v-btn v-if="step === 1" class="float-right mx-2" color="primary" text @click="step = 0">
        {{ $t('operate.previous') }}
      </v-btn>
      <v-btn v-if="step === 0" class="float-right mx-2" color="primary" text @click="check">
        {{ $t('operate.next') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import ProjectBaseForm from './ProjectBaseForm';
  import { getProjectDetail, putUpdateProject } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateProject',
    components: {
      ProjectBaseForm,
    },
    mixins: [BaseSelect],
    data: () => ({
      dialog: false,
      formComponent: 'ProjectBaseForm',
      step: 0,
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      check() {
        if (this.$refs[this.formComponent].validate()) this.step = 1;
      },
      async updateProject() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await putUpdateProject(data.ProjectID, {
            ProjectID: data.ProjectID,
            ProjectName: data.ProjectName,
            ProjectAlias: data.ProjectAlias,
            Remark: data.Remark,
          });

          await this.m_select_tenantProjectSelectData();
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(project) {
        const data = await getProjectDetail(project.ID);
        const item = deepCopy(data);
        this.$refs[this.formComponent].setData({
          ProjectID: item.ID,
          ProjectName: item.ProjectName,
          ProjectAlias: item.ProjectAlias,
          Remark: item.Remark,
        });
        this.$refs[this.formComponent].init();
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
      },
    },
  };
</script>
