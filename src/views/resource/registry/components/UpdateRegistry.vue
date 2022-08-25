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
    :title="$root.$t('operate.update_c', [$root.$t('resource.image_registry')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateRegistry">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import RegistryBaseForm from './RegistryBaseForm';
  import { getRegistryDetail, putUpdateRegistry } from '@/api';

  export default {
    name: 'UpdateRegistry',
    components: {
      RegistryBaseForm,
    },
    data: () => ({
      dialog: false,
      formComponent: 'RegistryBaseForm',
    }),
    computed: {
      ...mapState(['Circular', 'User']),
      ...mapGetters(['Tenant']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateRegistry() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await putUpdateRegistry({ projectid: data.ProjectID, registryid: data.RegistryID }, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      splitRegistry(registry, type) {
        const regExp = new RegExp(/([http|https]+):\/\/([\w|\.|-|\/|\d]+)?/, 'g');
        const match = regExp.exec(registry);
        if (match) {
          if (type === 'scheme') {
            return match[1];
          } else if (type === 'address') {
            return match[2];
          }
          return '';
        }
        return '';
      },
      async init(item) {
        const data = await getRegistryDetail({
          projectid: item.ProjectID,
          registryid: item.ID,
        });
        this.$refs[this.formComponent].scheme = this.splitRegistry(data.RegistryAddress, 'scheme');
        this.$refs[this.formComponent].setData({
          EnableExtends: data.EnableExtends,
          RegistryID: data.ID,
          RegistryName: data.RegistryName,
          RegistryAddress: this.splitRegistry(data.RegistryAddress, 'address'),
          Username: data.Username,
          UpdateTime: new Date(),
          CreatorID: data.CreatorID,
          TenantID: this.Tenant().ID,
          ProjectID: data.ProjectID,
          IsDefault: data.IsDefault,
        });
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
