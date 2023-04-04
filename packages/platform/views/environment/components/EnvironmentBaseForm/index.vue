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
    icon="mdi-cube"
    :title="i18n.t('operate.update_c', [i18n.t('resource.environment')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <v-flex :class="state.expand ? 'kubegems__overlay' : ''" />
        <AddNamespace ref="namespace" :cluster-id="obj.ClusterID" @addData="addNamespace" @closeOverlay="closeExpand" />
        <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.environment')])" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.EnvironmentName"
                class="my-0"
                :label="i18nLocal.t('form.name')"
                :readonly="state.edit"
                required
                :rules="objRules.environmentName"
              />
            </v-col>

            <v-col cols="6">
              <v-autocomplete
                v-model="obj.MetaType"
                class="my-0"
                color="primary"
                hide-selected
                :items="environmentTypeItems"
                :label="i18n.t('resource.type')"
                :no-data-text="i18n.t('data.no_data')"
                :rules="objRules.metaType"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                v-model="obj.DeletePolicy"
                class="my-0"
                color="primary"
                hide-selected
                :items="deletePolicyItems"
                :label="i18nLocal.t('form.delete_policy')"
                :no-data-text="i18n.t('data.no_data')"
                :rules="objRules.deletePolicy"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>

        <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.cluster')])" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-autocomplete
                v-model="obj.ClusterID"
                class="my-0"
                color="primary"
                hide-selected
                :items="clusterItems"
                :label="i18n.t('resource.cluster')"
                :no-data-text="i18n.t('data.no_data')"
                :readonly="state.edit"
                :rules="objRules.clusterID"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.Namespace"
                class="my-0"
                :label="i18n.t('resource.namespace')"
                :readonly="state.edit"
                required
                :rules="objRules.namespace"
              >
                <template #append>
                  <v-btn v-if="!state.edit" class="mt-n1" color="primary" small text @click.stop="openNamespaceCard">
                    <v-icon left small> mdi-link </v-icon>
                    {{ i18nLocal.t('operate.bind_ns') }}
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-textarea v-model="obj.Remark" auto-grow class="my-0" :label="i18nLocal.t('form.remark')" required />
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useClusterListInTenant } from '@kubegems/api/hooks/tenant';
  import { Environment } from '@kubegems/api/typed/environment';
  import { Tenant } from '@kubegems/api/typed/tenant';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required, k8sName } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { onMounted, reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import AddNamespace from './AddNamespace.vue';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    expand: false,
    edit: false,
  });

  const obj = ref<Environment>(new Environment());
  const objRules = {
    environmentName: [required, (v) => !!(v && v.length <= 20) || i18nLocal.t('form.limit_20_rule'), k8sName],
    clusterID: [required],
    projectID: [required],
    metaType: [required],
    namespace: [required, k8sName],
    deletePolicy: [required],
  };

  const environmentTypeItems = [
    { text: i18n.t('metadata.environment_type.dev'), value: 'dev' },
    { text: i18n.t('metadata.environment_type.test'), value: 'test' },
    { text: i18n.t('metadata.environment_type.prod'), value: 'prod' },
  ];

  const deletePolicyItems = [
    { text: i18nLocal.t('tip.delete_all_select'), value: 'delNamespace' },
    { text: i18nLocal.t('tip.delete_cascade_select'), value: 'delLabels' },
  ];

  const clusterItems = ref<{ text: string; value: number }[]>([]);
  const getClusterItems = async (): Promise<void> => {
    const data = await useClusterListInTenant(new Tenant({ ID: store.getters.Tenant().ID }));
    clusterItems.value = data.map((c) => {
      return { text: c.ClusterName, value: c.ID };
    });
  };

  onMounted(() => {
    getClusterItems();
  });

  const open = (): void => {
    state.dialog = true;
  };

  const init = async (item: Environment): Promise<void> => {
    state.edit = true;
    obj.value = await new Environment(item).getEnvironment();
  };

  defineExpose({
    open,
    init,
  });

  // add namespace
  const namespace = ref(null);
  const openNamespaceCard = () => {
    namespace.value.open();
    state.expand = true;
  };

  const closeExpand = (): void => {
    state.expand = false;
  };

  const addNamespace = (data: string): void => {
    obj.value.Namespace = data;
    namespace.value.closeCard();
  };

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate()) {
      if (state.edit) {
        await new Environment(obj.value).updateEnvironment();
      } else {
        await new Environment(obj.value).addEnvironment();
      }
      store.dispatch('UPDATE_ENVIRONMENT_DATA', store.getters.Project().ID);
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
    obj.value = new Environment();
  };
</script>
