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
  <div>
    <v-text-field
      v-model="search"
      class="search"
      clearable
      dense
      flat
      hide-details
      :label="i18nLocal.t('filter.search')"
      prepend-inner-icon="mdi-magnify"
      solo
    />
    <v-treeview
      activatable
      :active.sync="state.active"
      color="primary"
      dense
      expand-icon="mdi-chevron-down"
      item-key="treeId"
      :items="scopeItems"
      :load-children="getRuleResourceList"
      :open.sync="state.open"
      open-on-click
      return-object
      rounded
      :search="search"
      transition
    >
      <template #prepend="{ item }">
        <v-icon v-if="item.type === 'scope'" color="primary" left small> mdi-select-group </v-icon>

        <v-icon v-else color="primary" left small> mdi-format-size </v-icon>
      </template>
      <template #label="{ item }">
        <span class="text-body-2">{{ item.name }}</span>
      </template>
    </v-treeview>
  </div>
</template>

<script lang="ts" setup>
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { onMounted, reactive, ref, watch } from 'vue';

  import { useI18n } from '../i18n';
  import { useRuleResourceList, useRuleScopeList } from '@/composition/prometheus';
  import { RuleResource, RuleScope } from '@/types/prometheus_template';

  const i18nLocal = useI18n();
  const store = useStore();

  const search = ref<string>('');
  const state = reactive({
    active: [],
    open: [],
  });

  const scopeItems = ref<any[]>([]);
  const getRuleScopeList = async (): Promise<void> => {
    const data = await useRuleScopeList(store.getters.Tenant().ID, new RuleScope());
    const scopes = data.map((item) => ({
      type: 'scope',
      treeId: `s${item.id}`,
      id: item.id,
      name: item.showName,
      children: [],
    }));
    scopeItems.value = scopes;
    defaultActiveByQuery();
  };

  onMounted(() => {
    getRuleScopeList();
  });

  const getRuleResourceList = async (scope: any): Promise<void> => {
    const data = await useRuleResourceList(store.getters.Tenant().ID, new RuleResource({ scopeID: scope.id }));
    const children = data.map((item) => ({
      type: 'resource',
      treeId: `r${item.id}`,
      id: item.id,
      scopeId: scope.id,
      name: item.showName,
      scopeName: scope.name,
    }));
    scope.children = children;
  };

  const emit = defineEmits(['input', 'change']);
  const activeChanged = (value) => {
    const v = value[0];
    emit('input', v);
    emit('change', v);
  };

  watch(
    () => state.active,
    async (newValue) => {
      if (newValue) {
        activeChanged(newValue);
      }
    },
    {
      deep: true,
    },
  );

  const query = useQuery();
  const defaultActiveByQuery = async (): Promise<void> => {
    const { scopeId, resourceId } = query.value;
    let scopeItem = void 0;
    if (scopeId) {
      scopeItem = scopeItems.value.find((item) => item.id === parseInt(scopeId));
      scopeItem && (await getRuleResourceList({ id: scopeId }));
    }
    state.open = scopeItem ? [scopeItem] : [];
    state.active = resourceId
      ? [
          {
            type: 'resource',
            treeId: `r${resourceId}`,
            id: parseInt(resourceId),
            scopeId: parseInt(scopeId),
          },
        ]
      : [];
  };
</script>

<style lang="scss" scoped>
  .search {
    padding-top: 6px;
    margin-bottom: 8px;
  }
</style>
