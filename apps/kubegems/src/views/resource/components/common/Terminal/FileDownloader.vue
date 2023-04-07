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
    <v-btn color="primary" small text @click.stop="download">
      {{ i18n.t('operate.download') }}
    </v-btn>
  </v-flex>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';

  const props = withDefaults(
    defineProps<{
      fileName?: string;
    }>(),
    {
      fileName: '',
    },
  );

  const i18n = useGlobalI18n();
  const store = useStore();
  const query = useQuery();

  const download = () => {
    if (store.state.Edge) {
      window.open(
        `/api/v1/edge-clusters/${query.value.t_cluster}/proxy/custom/core/v1/namespaces/${query.value.t_namespace}/pods/${query.value.t_pod}/actions/file?filename=${props.fileName}&token=${store.state.JWT}&container=${query.value.t_container}`,
      );
    } else {
      window.open(
        `/api/v1/proxy/cluster/${query.value.t_cluster}/custom/core/v1/namespaces/${query.value.t_namespace}/pods/${query.value.t_pod}/actions/file?filename=${props.fileName}&token=${store.state.JWT}&container=${query.value.t_container}`,
      );
    }
  };
</script>
