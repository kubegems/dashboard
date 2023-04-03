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
    :title="i18nLocal.t('resource.tip.resource_scale')"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <ResourceBaseForm
        ref="resource"
        :cluster="tenantResourceQuota ? tenantResourceQuota.Cluster.ClusterName : ''"
        edit
        :quota="quota"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        :loading="store.state.Circular"
        text
        @click="updateTenantResourceQuota"
      >
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useClusterQuota } from '@kubegems/api/hooks/cluster';
  import { Cluster } from '@kubegems/api/typed/cluster';
  import { Tenant, TenantResourceQuota } from '@kubegems/api/typed/tenant';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import ResourceBaseForm from './ResourceBaseForm/index.vue';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
  });

  const open = (): void => {
    state.dialog = true;
  };

  const tenantResourceQuota = ref<TenantResourceQuota>(undefined);
  const quota = ref(undefined);
  const init = async (item: TenantResourceQuota): Promise<void> => {
    tenantResourceQuota.value = deepCopy(item);
    tenantResourceQuota.value.NowCpu = item.Cpu;
    tenantResourceQuota.value.NowMemory = item.Memory;
    tenantResourceQuota.value.NowStorage = item.Storage;
    if (item.NvidiaGpu) {
      tenantResourceQuota.value.NowNvidiaGpu = item.NvidiaGpu;
    }
    if (item.TkeGpu) {
      tenantResourceQuota.value.NowTkeGpu = item.TkeGpu;
    }
    if (item.TkeMemory) {
      tenantResourceQuota.value.NowTkeMemory = item.TkeMemory;
    }
    quota.value = await useClusterQuota(
      new Cluster({ ID: tenantResourceQuota.value.ClusterID }),
      tenantResourceQuota.value,
    );
    const content = {
      'limits.cpu': item.Cpu,
      'limits.memory': item.Memory,
      'limits.storage': item.Storage,
    };
    if (item.NvidiaGpu) {
      content['limits.nvidia.com/gpu'] = item.NvidiaGpu;
    }
    if (item.TkeGpu) {
      content['limits.tencent.com/vcuda-core'] = item.TkeGpu;
    }
    if (item.TkeMemory) {
      content['limits.tencent.com/vcuda-memory'] = item.TkeMemory;
    }

    resource.value.setContent(content);
  };

  const resource = ref(null);
  const emit = defineEmits(['refresh']);
  const updateTenantResourceQuota = async (): Promise<void> => {
    if (resource.value.validate()) {
      const data = deepCopy(resource.value.getData());
      data.Content['limits.memory'] = `${data.Content['limits.memory']}Gi`;
      data.Content[`limits.storage`] = `${data.Content[`limits.storage`]}Gi`;
      data.ClusterID = tenantResourceQuota.value.ClusterID;
      data.TenantID = tenantResourceQuota.value.TenantID;
      await new Tenant(tenantResourceQuota.value.Tenant).updateResourceQuota(data as TenantResourceQuota);
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    resource.value.reset();
    quota.value = undefined;
  };

  defineExpose({
    open,
    init,
  });
</script>
