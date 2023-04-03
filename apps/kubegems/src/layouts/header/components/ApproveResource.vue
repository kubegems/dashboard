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
    icon="mdi-scale"
    :title="i18nLocal.t('tip.resource_scale')"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <ResourceBaseForm ref="resource" :cluster="cluster" edit :quota="quota" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="state.passLoading" text @click="approvePass">
        {{ i18nLocal.t('operate.approve') }}
      </v-btn>
      <v-btn class="float-right" color="error" :loading="state.cancelLoading" text @click="approveReject">
        {{ i18nLocal.t('operate.reject') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { deepCopy, sizeOfCpu, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../i18n';
  import { useClusterQuota } from '@/composition/cluster';
  import { Cluster } from '@/types/cluster';
  import { Approve } from '@/types/message';
  import { Tenant } from '@/types/tenant';
  import ResourceBaseForm from '@/views/tenant/tenant/components/ResourceList/ResourceBaseForm/index.vue';

  const i18nLocal = useI18n();

  const state = reactive({
    dialog: false,
    passLoading: false,
    cancelLoading: false,
  });

  const open = (): void => {
    state.dialog = true;
  };

  const cluster = ref<string>(undefined);
  const approve = ref<Approve>(undefined);
  const quota = ref(undefined);
  const init = async (item: Approve): Promise<void> => {
    approve.value = deepCopy(item);
    const data = await new Tenant({ TenantName: approve.value.TenantName }).getResourceQuota(
      approve.value.ClusterName,
      { noprocessing: true },
    );
    approve.value.NowCpu = parseFloat(sizeOfCpu(data.spec.hard['limits.cpu']).toString());
    approve.value.NowMemory = parseFloat(sizeOfStorage(data.spec.hard['limits.memory']).toString());
    if (!data.spec.hard[`limits.storage`]) {
      data.spec.hard[`limits.storage`] = data.spec.hard[`requests.storage`] || 0;
    }
    approve.value.NowStorage = parseFloat(sizeOfStorage(data.spec.hard[`limits.storage`]).toString());
    if (item.Content[`limits.nvidia.com/gpu`]) {
      approve.value.NowNvidiaGpu = parseFloat(data.spec.hard['limits.nvidia.com/gpu']);
    }
    if (item.Content[`limits.tencent.com/vcuda-core`]) {
      approve.value.NowTkeGpu = parseFloat(data.spec.hard['limits.tencent.com/vcuda-core']);
    }
    if (item.Content[`limits.tencent.com/vcuda-memory`]) {
      approve.value.NowTkeMemory = parseFloat(data.spec.hard['limits.tencent.com/vcuda-memory']);
    }

    quota.value = await useClusterQuota(new Cluster({ ID: approve.value.ClusterID }), approve.value);
    if (!approve.value.Content[`limits.storage`]) {
      approve.value.Content[`limits.storage`] = approve.value.Content[`requests.storage`] || '0';
    }
    const content = {
      'limits.cpu': approve.value.Content[`limits.cpu`],
      'limits.memory': (approve.value.Content[`limits.memory`] as string).replaceAll('Gi', ''),
      'limits.storage': (approve.value.Content[`limits.storage`] as string).replaceAll('Gi', ''),
    };

    if (approve.value.NowNvidiaGpu) {
      content['limits.nvidia.com/gpu'] = approve.value.Content[`limits.nvidia.com/gpu`];
    }
    if (approve.value.NowTkeGpu) {
      content['limits.tencent.com/vcuda-core'] = approve.value.Content[`limits.tencent.com/vcuda-core`];
    }
    if (approve.value.NowTkeMemory) {
      content['limits.tencent.com/vcuda-memory'] = approve.value.Content[`limits.tencent.com/vcuda-memory`];
    }
    resource.value.setContent(content);
  };

  defineExpose({
    open,
    init,
  });

  const emit = defineEmits(['refresh']);

  const resource = ref(null);
  const approvePass = async (): Promise<void> => {
    if (resource.value.validate()) {
      state.passLoading = true;
      const data = {
        Content: {},
      };
      const obj = resource.value.getData();
      data.Content['limits.cpu'] = `${obj.Content['limits.cpu']}`;
      data.Content['limits.memory'] = `${obj.Content['limits.memory']}Gi`;
      data.Content[`limits.storage`] = `${obj.Content[`limits.storage`]}Gi`;

      if (obj.Content['limits.nvidia.com/gpu']) {
        data.Content['limits.nvidia.com/gpu'] = obj.Content[`limits.nvidia.com/gpu`];
      }
      if (obj.Content['limits.tencent.com/vcuda-core']) {
        data.Content['limits.tencent.com/vcuda-core'] = obj.Content[`limits.tencent.com/vcuda-core`];
      }
      if (obj.Content['limits.tencent.com/vcuda-memory']) {
        data.Content['limits.tencent.com/vcuda-memory'] = obj.Content[`limits.tencent.com/vcuda-memory`];
      }
      await new Approve(approve.value).passApprove();
      state.passLoading = false;
      reset();
      emit('refresh');
    }
  };

  const approveReject = async (): Promise<void> => {
    state.cancelLoading = true;
    await new Approve(approve.value).rejectApprove();
    state.cancelLoading = false;
    reset();
    emit('refresh');
  };

  const reset = (): void => {
    state.dialog = false;
    resource.value.reset();
    quota.value = undefined;
  };

  watch(
    () => approve,
    async (newValue) => {
      if (!newValue) return;
      cluster.value = newValue.value.ClusterName;
    },
    { deep: true },
  );
</script>
