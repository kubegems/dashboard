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
    icon="mdi-cloud-outline"
    :title="$root.$t('operate.update_c', [$root.$t('resource.mesh')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :edit="true"
        :item="item"
        :step="step"
        :title="$root.$t('resource.mesh')"
        @refresh="refresh"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1"
        class="float-right mx-2"
        color="primary"
        :loading="Circular"
        text
        @click="updateVirtualSpace"
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

  import messages from '../i18n';
  import VirtualSpaceBaseForm from './VirtualSpaceBaseForm';
  import { getVirtualSpaceDetail, putUpdateVirtualSpace } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateVirtualSpace',
    i18n: {
      messages: messages,
    },
    components: {
      VirtualSpaceBaseForm,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      formComponent: 'VirtualSpaceBaseForm',
      step: 0,
      totalStep: 3,
      item: null,
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateVirtualSpace() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await putUpdateVirtualSpace(data.ID, {
            VirtualSpaceName: data.VirtualSpaceName,
          });
          this.reset();
          this.$emit('refresh');
        }
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
        if (this.step === 1 && this.$refs[this.formComponent].obj.Environments.length === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.link_environment'),
            color: 'warning',
          });
          return;
        }
        if (this.step < this.totalStep - 1 && this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          this.step += 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      async init(item) {
        this.formComponent = 'VirtualSpaceBaseForm';
        const data = await getVirtualSpaceDetail(item.ID);
        this.item = deepCopy(data);
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
        this.formComponent = 'VirtualSpaceBaseForm';
      },
      refresh() {
        this.$emit('refresh');
      },
    },
  };
</script>
