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
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.spec.register.hubName"
            color="primary"
            hide-selected
            :items="edgeHubItems"
            :label="i18nLocal.t('tip.register_cluster')"
            :no-data-text="i18n.t('data.no_data')"
            :readonly="update"
            :rules="objRule.hubName"
          >
            <template #selection="{ item, disabled }">
              <v-chip color="primary" :disabled="disabled" small>
                {{ item.text }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import { useGlobalI18n } from '@/i18n';
  import { EdgeCluster, EdgeHub } from '@/types/edge_cluster';
  import { required } from '@/utils/rules';

  onMounted(() => {
    getEdgeHub();
  });

  const props = withDefaults(
    defineProps<{
      update?: boolean;
      edgeCluster?: EdgeCluster;
    }>(),
    {
      update: false,
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
    edgeHubItems.value = data.map((d) => {
      return {
        text: `${d.name} ${d.address}`,
        value: d.name,
        disabled: !d.connected,
      };
    });
  };
  const obj = reactive<EdgeCluster>(props.edgeCluster);
  const objRule = reactive({ hubName: [required] });

  const form = ref(null);
  const validate = (): boolean => {
    return form.value.validate();
  };

  defineExpose({
    validate,
  });
</script>
