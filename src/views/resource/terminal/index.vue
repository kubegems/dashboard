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
  <Terminal ref="terminal" />
</template>

<script lang="ts" setup>
  import { nextTick, onMounted, ref } from 'vue';

  import { useRoute } from '@/composition/router';
  import { Pod } from '@/types/pod';
  import Terminal from '@/views/resource/components/common/Terminal/index.vue';

  const route = useRoute();

  const pod = ref<Pod>(undefined);

  const getPod = async (): Promise<void> => {
    const data = await new Pod({ metadata: { name: route.params.name, namespace: route.query.namespace } }).getPod(
      route.query.cluster as string,
    );
    pod.value = data;
  };

  const terminal = ref(null);
  onMounted(() => {
    nextTick(async () => {
      await getPod();
      const item = {
        namespace: route.query.namespace,
        name: route.params.name,
        containers: pod.value.spec.containers,
      };
      let container = pod.value.spec.containers[0].name;
      if (route.query.container) container = route.query.container as string;
      terminal.value.init(container, item, route.query.type);
      terminal.value.open();
    });
  });
</script>
