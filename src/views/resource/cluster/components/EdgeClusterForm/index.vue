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
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-server-plus"
    :title="i18n.t('operate.add_c', [i18n.t('resource.edge_cluster')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component :is="components[state.step]" ref="form" :edge-cluster="edgeCluster" :update="state.update" />
    </template>
    <template #action>
      <v-btn
        v-if="state.step === 1"
        class="float-right mx-2"
        color="primary"
        :loading="store.state.Circular"
        text
        @click="confirm"
      >
        {{ i18n.t('operate.confirm') }}
      </v-btn>
      <v-btn v-if="state.step === 0" class="float-right mx-2" color="primary" text @click="next">
        {{ i18n.t('operate.next') }}
      </v-btn>
      <v-btn
        v-if="state.step > 0 && state.step < state.totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        @click="previous"
      >
        {{ i18n.t('operate.previous') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';

  import RegisterEdgeCluster from './RegisterEdgeCluster.vue';
  import RegisterMessage from './RegisterMessage.vue';
  import SelectCloudCluster from './SelectCloudCluster.vue';
  import { ENVIRONMENT_KEY, PROJECT_KEY, TENANT_KEY } from '@/constants/label';
  import { useGlobalI18n } from '@/i18n';
  import { useParams } from '@/router';
  import { useStore } from '@/store';
  import { EdgeCluster } from '@/types/edge_cluster';

  const props = withDefaults(
    defineProps<{
      inEnv?: boolean;
    }>(),
    {
      inEnv: false,
    },
  );

  const store = useStore();
  const i18n = useGlobalI18n();
  const routeParams = useParams();

  const state = reactive({
    dialog: false,
    step: 0,
    totalStep: 3,
    update: false,
  });

  let edgeCluster = ref<EdgeCluster>(new EdgeCluster());

  let components = ref([SelectCloudCluster, RegisterEdgeCluster, RegisterMessage]);

  const open = (): void => {
    state.dialog = true;
  };
  const init = async (item: EdgeCluster): Promise<void> => {
    edgeCluster.value = item;
    edgeCluster.value = await new EdgeCluster(edgeCluster.value).getEdgeCluster();
    state.update = true;
  };

  const emits = defineEmits(['refresh']);
  const form = ref(null);
  const next = async (): Promise<void> => {
    if (form.value.validate()) {
      state.step += 1;
    }
  };
  const previous = (): void => {
    state.step -= 1;
  };

  const confirm = async (): Promise<void> => {
    if (form.value.validate()) {
      if (state.step === 1) {
        state.update
          ? (async () => {
              edgeCluster.value = await new EdgeCluster(edgeCluster.value).updateEdgeCluster();
              reset();
              emits('refresh');
            })()
          : (async () => {
              if (props.inEnv) {
                edgeCluster.value.metadata.labels = Object.assign(edgeCluster.value.metadata.labels, {
                  [ENVIRONMENT_KEY]: routeParams.value.environment,
                  [PROJECT_KEY]: routeParams.value.project,
                  [TENANT_KEY]: routeParams.value.tenant,
                });
              }
              edgeCluster.value = await new EdgeCluster(edgeCluster.value).addEdgeCluster();
              state.step += 1;
            })();
      }
    }
  };

  const reset = (): void => {
    state.dialog = false;
    if (state.step === 2) {
      emits('refresh');
    }
    state.step = 0;
    state.update = false;
    edgeCluster.value = new EdgeCluster();
  };

  defineExpose({
    open,
    init,
  });
</script>
