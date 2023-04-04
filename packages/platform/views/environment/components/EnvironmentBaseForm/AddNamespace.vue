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
    <v-expand-transition>
      <v-card v-show="state.expand" class="mb-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-sheet class="pt-2 px-2">
          <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
            <span>{{ i18n.t('resource.namespace') }}</span>
          </v-flex>
          <v-flex class="float-left ml-2 kubegems__form-width">
            <v-autocomplete
              v-model="namespace"
              class="my-0"
              color="primary"
              hide-selected
              :items="namespaceItems"
              :label="i18n.t('resource.namespace')"
              :no-data-text="i18n.t('data.no_data')"
              :rules="namespaceRule"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ i18n.t('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ i18n.t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script lang="ts" setup>
  import { useClusterList } from '@kubegems/api/hooks/cluster';
  import { Cluster } from '@kubegems/api/typed/cluster';
  import { Namespace } from '@kubegems/api/typed/namespace';
  import { convertResponse2Pagination } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { computed, ComputedRef, onMounted, reactive, ref } from 'vue';

  const i18n = useGlobalI18n();
  const store = useStore();

  const props = withDefaults(
    defineProps<{
      clusterId?: number;
    }>(),
    {
      clusterId: undefined,
    },
  );

  const state = reactive({
    valid: false,
    expand: false,
  });

  const open = (): void => {
    state.expand = true;
  };

  defineExpose({
    open,
  });

  const namespace = ref('');
  const namespaceRule = [required];
  const form = ref(null);
  const emit = defineEmits(['addData', 'closeOverlay']);
  const addData = (): void => {
    if (form.value.validate(true)) {
      emit('addData', namespace.value);
    }
  };

  const closeCard = (): void => {
    state.expand = false;
    form.value.reset();
    emit('closeOverlay');
  };

  const clusterName: ComputedRef<string> = computed(() => {
    const cluster = clusterItems.value.find((c) => {
      return c.ID === props.clusterId;
    });
    if (cluster) return cluster.ClusterName;
    return '';
  });

  const clusterItems = ref<Cluster[]>([]);
  const getClusterItems = async (): Promise<void> => {
    clusterItems.value = await useClusterList(new Cluster());
  };

  const namespaceItems = ref<{ text: string; value: string }[]>([]);
  const getNamespaceItems = async (): Promise<void> => {
    if (!clusterName.value) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.select_cluster'),
        color: 'warning',
      });
      return;
    }
    const data = await new Namespace().getNamespaceList(clusterName.value, { page: 1, size: 1000 });
    namespaceItems.value = convertResponse2Pagination<Namespace>(data).map((ns) => {
      return {
        text: ns.metadata.name,
        value: ns.metadata.name,
      };
    });
  };

  onMounted(() => {
    getClusterItems();
    getNamespaceItems();
  });
</script>
