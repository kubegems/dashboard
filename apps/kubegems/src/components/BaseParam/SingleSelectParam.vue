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
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      :divider="false"
      :title="label"
    />
    <v-autocomplete
      :id="id"
      class="my-2"
      hide-selected
      :items="items"
      :label="pathLevel === 1 ? '' : label"
      :menu-props="{
        bottom: true,
        left: true,
        origin: `top center`,
      }"
      :rules="rules"
      :value="param.value"
      @change="changed($event)"
      @focus="getStorageClassList"
    >
      <template #selection="{ item }">
        <v-chip class="mx-1" color="primary" small>
          {{ item['text'] }}
        </v-chip>
      </template>
    </v-autocomplete>
  </v-flex>
</template>

<script lang="ts" setup>
  import { required } from '@kubegems/extension/ruler';
  import { ComputedRef, computed, onMounted, ref, watch } from 'vue';

  import { convertResponse2List } from '@/types/base';
  import { StorageClass } from '@/types/storageclass';

  const props = withDefaults(
    defineProps<{
      id?: string;
      label?: string;
      param?: any;
      level?: number;
      clusterName?: string;
    }>(),
    {
      id: undefined,
      label: '',
      param: {},
      level: 1,
      clusterName: '',
    },
  );

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const rules = [required];

  const emit = defineEmits(['changeBasicFormParam']);
  const changed = (event: string): void => {
    emit('changeBasicFormParam', props.param, event);
  };

  const items = ref<{ text: string; value: string }[]>([]);
  const getStorageClassList = async (): Promise<void> => {
    if ((props.param.name === 'storageClassName' || props.param.name === 'storageClass') && props.clusterName !== '') {
      const data = await new StorageClass().getStorageClassList(props.clusterName, { page: 1, size: 1000 });
      items.value = convertResponse2List<StorageClass>(data).map((d) => {
        return { text: d.metadata.name, value: d.metadata.name };
      });
    }
  };

  watch(
    () => props.clusterName,
    async (newValue) => {
      if (!newValue) return;
      if (
        (props.param.name === 'storageClassName' || props.param.name === 'storageClass') &&
        props.clusterName !== ''
      ) {
        getStorageClassList();
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    if (props.param.enum && props.param.enum.length > 0) {
      items.value = props.param.enum.map((enumValue) => {
        return { text: enumValue, value: enumValue };
      });
    }
    getStorageClassList();
  });
</script>
