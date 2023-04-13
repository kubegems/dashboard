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
  import { Pod } from '@kubegems/api/typed/pod';
  import { useParams, useQuery } from '@kubegems/extension/router';
  import { nextTick, onMounted, ref } from 'vue';

  import Terminal from '@/views/resource/components/common/Terminal/index.vue';

  const query = useQuery();
  const params = useParams();

  const pod = ref<Pod>(undefined);

  const getPod = async (): Promise<void> => {
    const data = await new Pod({ metadata: { name: params.value.name, namespace: query.value.namespace } }).getPod(
      query.value.cluster as string,
    );
    pod.value = data;
  };

  const terminal = ref(null);
  onMounted(() => {
    nextTick(async () => {
      await getPod();
      const item = {
        namespace: query.value.namespace,
        name: params.value.name,
        containers: pod.value.spec.containers,
      };
      let container = pod.value.spec.containers[0].name;
      if (query.value.container) container = query.value.container as string;
      terminal.value.init(container, item, query.value.type);
      terminal.value.open();
    });
  });
</script>
