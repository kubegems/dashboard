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
  <BaseDialog v-model="dialog" icon="mdi-recycle" :title="$t('operate.tcp_traffic_shift')" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :service="service" title="TcpTrafficShifting" :vs="vs" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addTcpTrafficShifting">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import TcpTrafficShiftingBaseForm from './TcpTrafficShiftingBaseForm';
  import { postAddTcpTrafficShifting } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'TcpTrafficShifting',
    i18n: {
      messages: messages,
    },
    components: {
      TcpTrafficShiftingBaseForm,
    },
    mixins: [BaseResource],
    props: {
      service: {
        type: Object,
        default: () => null,
      },
      vs: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      dialog: false,
      yaml: false,
      formComponent: 'TcpTrafficShiftingBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addTcpTrafficShifting() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'TcpTrafficShiftingBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.m_resource_beautifyData(data);
          }
          await postAddTcpTrafficShifting(
            this.VirtualSpace().ID,
            this.$route.query.environmentid,
            this.$route.params.name,
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      init() {
        this.formComponent = 'TcpTrafficShiftingBaseForm';
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = '';
        this.yaml = false;
      },
    },
  };
</script>
