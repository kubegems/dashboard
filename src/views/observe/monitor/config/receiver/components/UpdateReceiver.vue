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
    icon="mdi-call-received"
    :title="$root.$t('operate.update_c', [$root.$t('resource.receiver')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" :item="item" title="Receiver" />
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="Circular" text @click="updateReceiver">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import ReceiverBaseForm from './ReceiverBaseForm';
  import { putUpdateReceiver } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateReceiver',
    components: {
      ReceiverBaseForm,
    },
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      dialog: false,
      formComponent: 'ReceiverBaseForm',
      item: {},
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init(item) {
        this.item = deepCopy(item);
      },
      async updateReceiver() {
        if (this.$refs[this.formComponent].validate()) {
          let data = this.$refs[this.formComponent].getData();
          data = this.m_resource_beautifyData(data);
          await putUpdateReceiver(this.$route.query.cluster, this.$route.query.namespace, data.name, data);

          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'ReceiverBaseForm';
      },
    },
  };
</script>
