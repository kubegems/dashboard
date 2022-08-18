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
    :title="$root.$t('operate.add_c', [$root.$t('header.model_store')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :step="step"
        :title="$root.$t('header.model_store')"
        @changeStep="changeStep"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1"
        class="float-right mx-2"
        color="primary"
        :loading="Circular"
        text
        @click="addModelRegistry"
      >
        {{ $root.$t('operate.confirm') }}
      </v-btn>
      <v-btn v-if="step >= 0 && step < totalStep - 1" class="float-right mx-2" color="primary" text @click="nextStep">
        {{ $root.$t('operate.next') }}
      </v-btn>
      <v-btn v-if="step > 0 && step <= totalStep - 1" class="float-right mx-2" color="primary" text @click="lastStep">
        {{ $root.$t('operate.previous') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import ModelRegistryBaseForm from './ModelRegistryBaseForm';
  import { postAdminModelSource, postModelStoreAdminList } from '@/api';

  export default {
    name: 'AddModelRegistry',
    components: {
      ModelRegistryBaseForm,
    },
    data() {
      return {
        dialog: false,
        formComponent: 'ModelRegistryBaseForm',
        step: 0,
        totalStep: 2,
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addModelRegistry() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          const resdata = await postAdminModelSource(data);
          if (data.users) {
            data.users.forEach(async (username) => {
              await postModelStoreAdminList(resdata.name, username);
            });
          }
          this.reset();
          this.$emit('refresh');
        }
      },
      changeStep(totalStep) {
        this.totalStep = totalStep;
      },
      lastStep() {
        if (this.step > 0) {
          const data = this.$refs[this.formComponent].getData();
          this.step -= 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].back(data);
          });
        }
      },
      nextStep() {
        if (this.step < this.totalStep - 1 && this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          this.step += 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      init() {
        this.formComponent = 'ModelRegistryBaseForm';
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
        this.formComponent = 'ModelRegistryBaseForm';
      },
    },
  };
</script>
