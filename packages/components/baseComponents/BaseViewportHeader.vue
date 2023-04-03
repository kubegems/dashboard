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
  <component :is="component" :environmented="environmented" :selectable="selectable" />
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      clusterable?: boolean;
      environmented?: boolean;
      selectable?: boolean;
    }>(),
    {
      clusterable: false,
      environmented: true,
      selectable: true,
    },
  );

  const store = useStore();
  const component = computed(() => {
    return store.state.AdminViewport || props.clusterable
      ? 'BaseClusterHeader'
      : props.environmented
      ? 'BaseEnvironmentHeader'
      : 'BaseProjectHeader';
  });
</script>
