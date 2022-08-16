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
    icon="mdi-repeat-once"
    :title="$root.$t('operate.update_c', [$root.$t('resource.job')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :edit="true"
        :item="item"
        kind="Job"
        :step="step"
        title="Job"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1 || formComponent === 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        :loading="Circular"
        text
        @click="updateJob"
      >
        {{ $root.$t('operate.confirm') }}
      </v-btn>
      <v-btn
        v-if="step >= 0 && step < totalStep - 1 && formComponent !== 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="nextStep"
      >
        {{ $root.$t('operate.next') }}
      </v-btn>
      <v-btn
        v-if="step > 0 && step <= totalStep - 1 && formComponent !== 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="lastStep"
      >
        {{ $root.$t('operate.previous') }}
      </v-btn>
    </template>
    <template #header-action>
      <v-switch
        :key="switchKey"
        v-model="yaml"
        class="ma-0 pl-2 ml-2 mt-1"
        color="white"
        hide-details
        :style="{ marginTop: `8px !important` }"
        @change="onYamlSwitchChange"
      >
        <template #label>
          <span class="text-subject-1 white--text font-weight-medium"> YAML </span>
        </template>
      </v-switch>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import JobBaseForm from './JobBaseForm';
  import { getJobDetail, patchUpdateJob } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy, randomString } from '@/utils/helpers';
  import JobSchema from '@/views/resource/job/mixins/schema';

  export default {
    name: 'UpdateJob',
    i18n: {
      messages: messages,
    },
    components: {
      JobBaseForm,
    },
    mixins: [BaseResource, JobSchema],
    data: () => ({
      dialog: false,
      yaml: false,
      item: null,
      formComponent: 'JobBaseForm',
      step: 0,
      totalStep: 4,
      switchKey: '',
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateJob() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            data = this.$yamlload(data);
            if (!this.m_resource_checkDataWithNS(data, this.item.metadata.namespace)) return;
            if (!this.m_resource_validateJsonSchema(this.schema, data)) {
              return;
            }
          } else if (this.formComponent === 'JobBaseForm') {
            data = this.$refs[this.formComponent].getData();
          }
          data = this.m_resource_beautifyData(data);
          await patchUpdateJob(this.ThisCluster, this.item.metadata.namespace, this.item.metadata.name, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        const data = await getJobDetail(this.ThisCluster, item.metadata.namespace, item.metadata.name);
        this.formComponent = 'JobBaseForm';
        this.item = deepCopy(data);
      },
      onYamlSwitchChange() {
        if (this.yaml) {
          const data = this.$refs[this.formComponent].getData();
          this.m_resource_addNsToData(data, this.AdminViewport ? this.item.metadata.namespace : this.ThisNamespace);
          this.formComponent = 'BaseYamlForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].setYaml(this.$yamldump(data));
          });
        } else {
          const yaml = this.$refs[this.formComponent].getYaml();
          const data = this.$yamlload(yaml);
          this.m_resource_addNsToData(data, this.AdminViewport ? this.item.metadata.namespace : this.ThisNamespace);
          if (!this.m_resource_validateJsonSchema(this.schema, data)) {
            this.yaml = true;
            this.switchKey = randomString(6);
            return;
          }
          this.formComponent = 'JobBaseForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      lastStep() {
        if (!this.$refs[this.formComponent]) {
          return;
        }
        if (!this.$refs[this.formComponent].checkSaved()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.save_data'),
            color: 'warning',
          });
          return;
        }
        if (this.step > 0) {
          const data = this.$refs[this.formComponent].getData();
          this.step -= 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].back(data);
          });
        }
      },
      nextStep() {
        if (!this.$refs[this.formComponent]) {
          return;
        }
        if (!this.$refs[this.formComponent].checkSaved()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.save_data'),
            color: 'warning',
          });
          return;
        }
        if (this.step < this.totalStep - 1 && this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          if (
            this.step === 1 &&
            (!data.spec.template.spec.containers ||
              (data.spec.template.spec.containers && data.spec.template.spec.containers.length === 0))
          ) {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$t('tip.add_image'),
              color: 'warning',
            });
            return;
          }
          this.step += 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
        this.formComponent = '';
        this.yaml = false;
      },
    },
  };
</script>
