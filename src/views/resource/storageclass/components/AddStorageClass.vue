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
    icon="mdi-database-plus"
    :title="$root.$t('operate.create_c', [$root.$t('resource.storageclass')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <BaseYamlForm ref="yamlForm" title="StorageClass" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addStorageClass">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
    <template #header-action>
      <div class="text-h6 ml-2 white--text mt-1">Yaml</div>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { postAddStorageClass } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AddStorageClass',
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addStorageClass() {
        if (this.$refs.yamlForm.validate()) {
          let data = this.$refs.yamlForm.getYaml();
          data = this.$yamlload(data);
          if (!this.m_resource_checkDataWithOutNS(data)) return;
          data = this.m_resource_beautifyData(data);
          await postAddStorageClass(this.ThisCluster, data.metadata.name, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.yamlForm.reset();
      },
    },
  };
</script>
