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
  <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
    <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('tip.register_cluster')])" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="8">
          <v-autocomplete
            v-model="obj.spec.register.hubName"
            color="primary"
            :items="edgeHubItems"
            :label="i18nLocal.t('tip.register_cluster')"
            :no-data-text="i18n.t('data.no_data')"
            :rules="objRule.hubName"
          >
            <template #item="{ item, disabled }">
              <v-chip class="mr-1" color="primary" :disabled="disabled" label small>
                {{ item.value }}
              </v-chip>
              {{ i18nLocal.t('table.address') }}: {{ item.text }}
            </template>
            <template #selection="{ item, disabled }">
              <v-chip class="mr-1" color="primary" :disabled="disabled" label small>
                {{ item.value }}
              </v-chip>
              {{ i18nLocal.t('table.address') }}: {{ item.text }}
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { EdgeCluster } from '@kubegems/api/typed/edge_cluster';
  import { EdgeHub } from '@kubegems/api/typed/edge_hub';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { onMounted, reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  // import { required } from '@kubegems/extension/ruler';

  onMounted(() => {
    getEdgeHub();
  });

  const props = withDefaults(
    defineProps<{
      // update?: boolean;
      edgeCluster?: EdgeCluster;
    }>(),
    {
      // update: false,
      edgeCluster: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const state = reactive({
    valid: false,
  });

  let edgeHubItems = ref([]);
  const getEdgeHub = async (): Promise<void> => {
    const data: EdgeHub[] = await new EdgeHub().getEdgeHubList({ noprocessing: true });
    edgeHubItems.value = data.map((d: EdgeHub) => {
      return {
        text: d.status.address,
        value: d.metadata.name,
        disabled: !d.status.tunnel.connected,
      };
    });
  };
  const obj = reactive<EdgeCluster>(props.edgeCluster);
  const objRule = reactive({ hubName: [] });

  const form = ref(null);
  const validate = (): boolean => {
    return form.value.validate();
  };

  defineExpose({
    validate,
  });
</script>
