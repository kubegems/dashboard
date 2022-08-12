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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />

    <LinkEnvironmentForm ref="linkEnvironmentForm" @addData="addData" @closeOverlay="closeExpand" />
    <BaseSubTitle :title="$t('operate.link_c', [$root.$t('resource.environment')])" />
    <v-card-text class="pa-2">
      <EnvironmentItem
        :environments="obj.Environments"
        @expandCard="expandCard"
        @removeEnvironment="removeEnvironment"
        @updateEnvironment="updateEnvironment"
      />
    </v-card-text>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../i18n';
  import EnvironmentItem from './EnvironmentItem';
  import LinkEnvironmentForm from './LinkEnvironmentForm';
  import { deleteVirtualSpaceEnvironment, postAddVirtualSpaceEnvironment } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'LinkEnvironment',
    i18n: {
      messages: messages,
    },
    components: {
      EnvironmentItem,
      LinkEnvironmentForm,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        obj: {
          VirtualSpaceName: '',
          Environments: [],
          Users: [],
        },
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
    },
    watch: {
      item() {
        this.loadData();
      },
    },
    mounted() {
      this.loadData();
    },
    methods: {
      async loadData() {
        this.$nextTick(() => {});
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      async addData(data) {
        if (data.index === -1) {
          if (this.edit) {
            await postAddVirtualSpaceEnvironment(
              this.obj.ID,
              Object.assign(data, {
                VirtualSpaceID: this.obj.ID,
                ID: data.value,
                EnvironmentName: data.text,
              }),
            );
          }
          this.obj.Environments.push(Object.assign(data, { ID: data.value, EnvironmentName: data.text }));
        } else {
          if (this.edit) {
            await deleteVirtualSpaceEnvironment(this.obj.ID, data.value);
            await postAddVirtualSpaceEnvironment(
              this.obj.ID,
              Object.assign(data, {
                ID: data.value,
                EnvironmentName: data.text,
                VirtualSpaceID: this.obj.ID,
              }),
            );
          }
          this.$set(
            this.obj.Environments,
            data.index,
            Object.assign(data, {
              ID: data.value,
              EnvironmentName: data.text,
            }),
          );
          this.$emit('refresh');
        }
      },
      expandCard() {
        this.$nextTick(() => {
          this.$refs.linkEnvironmentForm.expandCard();
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      updateEnvironment(index) {
        const data = this.obj.Environments[index];
        this.$refs.linkEnvironmentForm.init({
          index: index,
          projectid: data.ProjectID,
          environmentid: data.ID,
        });
        this.$refs.linkEnvironmentForm.expandCard();
        this.expand = true;
      },
      async removeEnvironment(index) {
        if (this.edit) {
          const env = this.obj.Environments[index];
          await deleteVirtualSpaceEnvironment(this.obj.ID, env.ID);
        }
        this.$delete(this.obj.Environments, index);
        this.$emit('refresh');
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
