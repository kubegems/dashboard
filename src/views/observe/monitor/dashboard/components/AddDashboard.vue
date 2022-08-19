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
    icon="mdi-chart-areaspline"
    :title="$root.$t('operate.create_c', [$t('tip.minitor_dashboard')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addDashboard">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import DashboardBaseForm from './DashboardBaseForm';
  import { postAddMonitorDashboard } from '@/api';

  export default {
    name: 'AddDashboard',
    i18n: {
      messages: messages,
    },
    components: {
      DashboardBaseForm,
    },
    props: {
      environment: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        dialog: false,
        formComponent: 'DashboardBaseForm',
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addDashboard() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'DashboardBaseForm') {
            data = this.$refs[this.formComponent].getData();
          }
          await postAddMonitorDashboard(this.environment.value, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
