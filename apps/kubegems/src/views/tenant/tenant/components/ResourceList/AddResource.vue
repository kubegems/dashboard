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
    :title="i18n.t('operate.create_c', [i18nLocal.t('resource.cluster')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <ResourceBaseForm ref="resource" :quota="quota" @clusterChanged="clusterChanged" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="addTenantResourceQuota">
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

  const props = withDefaults(
    defineProps<{
      tenantResourceQuotaItems?: TenantResourceQuota[];
    }>(),
    {
      tenantResourceQuotaItems: undefined,
    },
  );

  const state = reactive({
    dialog: false,
  });

  const open = (): void => {
    state.dialog = true;
  };

  const tenant = ref<Tenant>(undefined);
  const init = (item: Tenant): void => {
    tenant.value = deepCopy(item);
  };

  const resource = ref(null);
  const reset = (): void => {
    state.dialog = false;
    resource.value.reset();
    quota.value = undefined;
  };

  const quota = ref(undefined);
  const clusterChanged = async (clusterId: number): Promise<void> => {
    quota.value = await useClusterQuota(new Cluster({ ID: clusterId }), {
      NowCpu: 0,
      NowMemory: 0,
      NowStorage: 0,
    });
  };

  const emit = defineEmits(['refresh']);
  const addTenantResourceQuota = async () => {
    if (resource.value.validate()) {
      const data = deepCopy(resource.value.getData());
      if (
        props.tenantResourceQuotaItems?.some((c) => {
          return c.ClusterID === data.ClusterID;
        })
      ) {
        store.commit('SET_SNACKBAR', {
          text: i18nLocal.t('resource.tip.cluster_exist'),
          color: 'warning',
        });
        return;
      }
      data.Content['limits.memory'] = `${data.Content['limits.memory']}Gi`;
      data.Content[`limits.storage`] = `${data.Content[`limits.storage`]}Gi`;
      data.TenantID = tenant.value.ID;
      await new Tenant(tenant.value).addResourceQuota(data as TenantResourceQuota);
      reset();
      emit('refresh');
    }
  };

  defineExpose({
    open,
    init,
  });
</script>
