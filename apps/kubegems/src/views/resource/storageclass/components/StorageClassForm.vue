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
    v-model="state.dialog"
    icon="mdi-database"
    :title="i18n.t('operate.update_c', [i18n.t('resource.storageclass')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <BaseYamlForm ref="yamlForm" :item="storageClass" title="StorageClass" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
    <template #header-action>
      <div class="text-h6 ml-2 white--text mt-1">Yaml</div>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { StorageClass } from '@kubegems/api/typed/storageclass';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useBeautifyData, useCheckDataWithOutNS, useCluster } from '@kubegems/extension/resource';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import yaml from 'js-yaml';
  import { reactive, ref } from 'vue';

  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    isEdit: false,
  });

  const yamlForm = ref(null);
  const reset = (): void => {
    state.dialog = false;
    state.isEdit = false;
    yamlForm.value.reset();
    storageClass.value = undefined;
  };

  const open = (): void => {
    state.dialog = true;
  };

  const storageClass = ref<StorageClass>(undefined);
  const init = async (item: StorageClass): Promise<void> => {
    const data = await new StorageClass(item).getStorageClass(useCluster());
    storageClass.value = deepCopy(data);
    state.isEdit = true;
  };

  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (yamlForm.value.validate()) {
      let data = yamlForm.value.getYaml();
      data = yaml.load(data);
      if (!useCheckDataWithOutNS(data)) return;
      data = useBeautifyData(data);
      if (state.isEdit) {
        await new StorageClass(storageClass.value).updateStorageClass(useCluster());
      } else {
        await new StorageClass(storageClass.value).addStorageClass(useCluster());
      }
      reset();
      emit('refresh');
    }
  };

  defineExpose({
    open,
    init,
  });
</script>
