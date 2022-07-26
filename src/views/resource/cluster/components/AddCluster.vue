<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <BaseDialog v-model="dialog" icon="mdi-server-plus" title="添加集群" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :control="control" :step="step" @refresh="refresh" />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1"
        class="float-right mx-2"
        color="primary"
        :loading="Circular"
        text
        @click="addCluster"
      >
        确定
      </v-btn>
      <v-btn
        v-if="step >= 0 && step < totalStep - 1"
        class="float-right mx-2"
        color="primary"
        :disabled="step === 1 && extend.validate !== 'success'"
        text
        @click="nextStep"
      >
        下一步
      </v-btn>
      <v-btn v-if="step > 0 && step <= totalStep - 1" class="float-right mx-2" color="primary" text @click="lastStep">
        上一步
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import ClusterBaseForm from './ClusterBaseForm';
  import { postAddCluster } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'AddCluster',
    components: {
      ClusterBaseForm,
    },
    mixins: [BaseFilter, BaseSelect],
    props: {
      control: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      dialog: false,
      step: 0,
      totalStep: 3,
      extend: null,
      formComponent: 'ClusterBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addCluster() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          const config = this.$yamlload(data.KubeConfig);
          if (!config) return;
          await postAddCluster({
            ClusterName: data.ClusterName,
            Primary: data.Primary,
            KubeConfig: config,
            Vendor: data.Vendor,
            ImageRepo: data.ImageRepo,
            DefaultStorageClass: data.DefaultStorageClass,
          });
          this.reset();
          this.$emit('refresh');
          this.$store.dispatch('UPDATE_CLUSTER_DATA');
        }
      },
      lastStep() {
        if (!this.$refs[this.formComponent]) {
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
        if (this.step === 0) {
          const data = this.$refs[this.formComponent].getData();
          if (data.KubeConfig.trim() === '') {
            this.$store.commit('SET_SNACKBAR', {
              text: '请输入KubeConfig',
              color: 'warning',
            });
            return;
          }
        }
        this.extend = this.$refs[this.formComponent].getExtend();
        if (this.step < this.totalStep - 1 && this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          this.step += 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      refresh(data) {
        this.extend = data.extend;
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
      },
    },
  };
</script>
