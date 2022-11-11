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
    :title="$root.$t('operate.update_c', [$t('resource.channel')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" :item="item" title="channel" />
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="Circular" text @click="updateChannel">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import ChannelBaseForm from './ChannelBaseForm';
  import { getChannelDetail, putUpdateChannel } from '@/api';

  export default {
    name: 'UpdateChannel',
    i18n: {
      messages: messages,
    },
    components: {
      ChannelBaseForm,
    },
    data() {
      return {
        dialog: false,
        formComponent: 'ChannelBaseForm',
        item: null,
      };
    },
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['Tenant']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init(item) {
        this.channelDetail(item);
      },
      async channelDetail(item) {
        const data = await getChannelDetail(this.Tenant().ID, item.id);
        this.item = data;
      },
      async updateChannel() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await putUpdateChannel(this.Tenant().ID, data.id, data);

          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.formComponent = 'ChannelBaseForm';
      },
    },
  };
</script>
