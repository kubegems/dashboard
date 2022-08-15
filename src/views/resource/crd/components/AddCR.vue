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
    icon="mdi-collage"
    :title="$root.$t('operate.create_c', [$root.$t('resource.cr')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <BaseYamlForm ref="yamlForm" :item="item" :title="crd ? crd.spec.names.kind : ''" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addCR">
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

  import { postAddCR } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'AddCR',
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      item: null,
      crd: null,
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addCR() {
        if (this.$refs.yamlForm.validate()) {
          let data = this.$refs.yamlForm.getYaml();
          data = this.$yamlload(data);
          let namespace = '';
          if (this.crd.spec.scope === 'Cluster') {
            namespace = '';
            if (!this.m_resource_checkDataWithOutNS(data)) return;
          } else {
            namespace = this.AdminViewport ? data?.metadata?.namespace : this.ThisNamespace;
            if (!this.m_resource_checkDataWithNS(data, namespace)) {
              return;
            }
          }
          data = this.m_resource_beautifyData(data);
          await postAddCR(
            this.ThisCluster,
            namespace,
            data.metadata.name,
            this.crd.spec.group,
            this.crd.status.storedVersions[0],
            this.crd.spec.names.plural,
            this.crd.spec.scope,
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(crd) {
        this.crd = deepCopy(crd);
      },
      reset() {
        this.dialog = false;
        this.$refs.yamlForm.reset();
      },
    },
  };
</script>
