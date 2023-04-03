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
  <div>
    <v-col cols="6">
      <v-text-field
        v-model="obj.spec.targets.staticConfig.static[0]"
        class="my-0"
        label="Host"
        required
        :rules="objRule.hostRules"
      />
    </v-col>
  </div>
</template>

<script lang="ts" setup>
  import { required } from '@kubegems/extension/ruler';
  import { reactive, watch } from 'vue';

  import { PrometheusProbe } from '@/types/prometheus_probe';

  const props = withDefaults(
    defineProps<{
      probe?: PrometheusProbe;
    }>(),
    {
      probe: undefined,
    },
  );

  let obj = reactive<PrometheusProbe>(props.probe);
  const objRule = reactive({
    hostRules: [required],
  });

  watch(
    () => props.probe,
    async (value) => {
      if (!value) return;
      obj = Object.assign(obj, value);
    },
    {
      deep: true,
    },
  );
</script>
