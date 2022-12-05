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
  <div />
</template>

<script lang="ts" setup>
  import { watch } from 'vue';

  // import { useI18n } from '../../i18n';
  // import { useServicePagination } from '@/composition/telemetry';
  // import { useGlobalI18n } from '@/i18n';
  import { Telemetry } from '@/types/opentelemetry';

  // const i18n = useGlobalI18n();
  // const i18nLocal = useI18n();

  type Env = {
    clusterName: string;
    namespace: string;
  };

  const props = withDefaults(
    defineProps<{
      env?: Env;
    }>(),
    {
      env: undefined,
    },
  );

  watch(
    () => props.env,
    async (newValue) => {
      if (newValue) {
        new Telemetry().getOverview(props.env.clusterName, props.env.namespace);
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );
</script>
