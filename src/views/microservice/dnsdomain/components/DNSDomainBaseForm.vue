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
  <v-flex>
    <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.dns')])" />
    <v-card-text class="pa-2">
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-sheet>
          <v-text-field
            v-model="obj.VirtualDomainName"
            class="my-0"
            :label="$root.$t('resource.dns')"
            required
            :rules="objRules.virtualDomainNameRules"
          />
        </v-sheet>
      </v-form>
    </v-card-text>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import BaseResource from '@/mixins/resource';
  import { required } from '@/utils/rules';

  export default {
    name: 'DNSDomainBaseForm',
    mixins: [BaseResource],
    data: () => ({
      valid: false,
      obj: {
        VirtualDomainName: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          virtualDomainNameRules: [required],
        };
      },
    },
    methods: {
      reset() {
        this.$refs.form.reset();
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      setData(data) {
        this.obj = data;
      },
    },
  };
</script>
