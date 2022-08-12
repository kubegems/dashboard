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
    <BaseSubTitle :title="$t('form.definition', [$root.$t('resource.mesh')])" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.VirtualSpaceName"
            class="my-0"
            :label="$t('form.name')"
            :readonly="edit"
            required
            :rules="objRules.virtualSpaceNameRule"
          />
        </v-col>
        <!-- <v-col cols="2">
          <v-switch v-model="obj.dns" class="mt-4" label="启用DNS"></v-switch>
        </v-col> -->
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'VirtualSpaceBaseInfo',
    i18n: {
      messages: messages,
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
        obj: {
          VirtualSpaceName: '',
          Environments: [],
          Users: [],
        },
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      objRules() {
        return {
          virtualSpaceNameRule: [required, (v) => !!(v && v.length <= 20) || this.$t('form.name_rule')],
        };
      },
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
        this.$nextTick(() => {
          if (this.item) this.obj = deepCopy(this.item);
        });
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = this.$_.merge(this.obj, deepCopy(data));
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
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
