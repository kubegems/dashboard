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
  <v-flex class="my-0 mt-0">
    <BaseSubTitle
      class="my-0 mt-0"
      :color="pathLevel === 1 ? 'grey lighten-3' : pathLevel > 1 ? 'grey lighten-5' : ''"
      :divider="false"
      :freeze="pathLevel !== 1"
      :pl="pathLevel >= 1 ? 2 : 0"
      :title="label"
    />

    <v-flex
      class="my-0 mt-0"
      :style="{ paddingLeft: `${4 * pathLevel}px` }"
      :v-if="param.children && param.children.length > 0"
    >
      <BaseParam
        v-for="(childrenParam, index) in param.children"
        :id="`${id}-${index}`"
        :key="`${id}-${index}`"
        :all-params="allParams"
        :allow-delete="allowDelete"
        :app-values="appValues"
        class="my-0 mt-0"
        :cluster-name="clusterName"
        :param="childrenParam"
        v-bind="$attrs"
        v-on="$listeners"
      />
    </v-flex>
  </v-flex>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      label?: string;
      param?: any;
      level?: number;
      clusterName?: string;
      allParams?: any[];
      appValues?: any;
      allowDelete?: boolean;
    }>(),
    {
      id: undefined,
      label: '',
      param: {},
      level: 1,
      clusterName: '',
      allParams: undefined,
      appValues: {},
      allowDelete: false,
    },
  );

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });
</script>
