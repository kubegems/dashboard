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
    icon="mdi-apps"
    :title="$root.$t('operate.update_c', [$root.$t('resource.app')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateApp">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import AppBaseForm from './AppBaseForm';
  import { getManifestDetail, putUpdateManifest } from '@/api';

  export default {
    name: 'UpdateAppManifest',
    components: {
      AppBaseForm,
    },
    data: () => ({
      dialog: false,
      formComponent: 'AppBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateApp() {
        if (!this.$refs[this.formComponent]) {
          return;
        }
        if (!this.$refs[this.formComponent].checkSaved()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.save_data'),
            color: 'warning',
          });
          return;
        }
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await putUpdateManifest(data.TenantID, data.ProjectID, data.name, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        const data = await getManifestDetail(item.TenantID, item.ProjectID, item.name);
        this.$refs[this.formComponent].setData(
          Object.assign(data, {
            TenantID: item.TenantID,
            ProjectID: item.ProjectID,
          }),
        );
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
