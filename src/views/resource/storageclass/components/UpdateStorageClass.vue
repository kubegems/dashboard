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
    icon="mdi-database"
    :title="$root.$t('operate.update_c', [$root.$t('resource.storageclass')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <BaseYamlForm ref="yamlForm" :item="item" title="StorageClass" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateStorageClass">
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

  import { getStorageClassDetail, patchUpdateStorageClass } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateStorageClass',
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      item: null,
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateStorageClass() {
        if (this.$refs.yamlForm.validate()) {
          let data = this.$refs.yamlForm.getYaml();
          data = this.$yamlload(data);
          if (!this.m_resource_checkDataWithOutNS(data)) return;
          data = this.m_resource_beautifyData(data);
          await patchUpdateStorageClass(this.ThisCluster, this.item.metadata.name, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        const data = await getStorageClassDetail(this.ThisCluster, item.metadata.name);
        this.item = deepCopy(data);
      },
      reset() {
        this.dialog = false;
        this.$refs.yamlForm.reset();
      },
    },
  };
</script>
