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
      :label="$t('filter.search')"
      prepend-inner-icon="mdi-magnify"
      solo
    />
    <v-treeview
      activatable
      :active.sync="active"
      color="primary"
      dense
      item-key="treeId"
      :items="items"
      :load-children="resourceList"
      :open.sync="open"
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

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getRuleResourceList, getRuleScopeList } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ScopeResourceTree',
    i18n: {
      messages: messages,
    },
    mixins: [BaseSelect],
    data() {
      return {
        items: [],
        active: [],
        open: [],
        search: '',
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      ...mapState(['AdminViewport']),
    },
    watch: {
      active: {
        handler(newValue) {
          if (newValue && newValue.length > 0) {
            this.onActiveChange(newValue);
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.ruleScopeList();
    },
    methods: {
      async ruleScopeList() {
        const data = await getRuleScopeList(this.Tenant().ID, { size: 1000 });

        this.items = data.List.map((item) => ({
          type: 'scope',
          treeId: `s${item.id}`,
          id: item.id,
          name: item.showName,
          children: [],
        }));
        this.defaultActiveByQuery();
      },
      async resourceList(scope) {
        const data = await getRuleResourceList(this.Tenant().ID, scope.id, { size: 1000 });

        const children = data.List.map((item) => ({
          type: 'resource',
          treeId: `r${item.id}`,
          id: item.id,
          scopeId: scope.id,
          name: item.showName,
          scopeName: scope.name,
        }));
        this.$set(scope, 'children', children);
      },
      onActiveChange(value) {
        const v = value[0];
        this.$emit('input', v);
        this.$emit('change', v);
      },
      async defaultActiveByQuery() {
        const { scopeId, resourceId } = this.$route.query;
        let scopeItem = void 0;
        if (scopeId) {
          scopeItem = this.items.find((item) => item.id === parseInt(scopeId));
          scopeItem && (await this.resourceList({ id: scopeId }));
        }
        this.open = scopeItem ? [scopeItem] : [];
        this.active = resourceId
          ? [
              {
                type: 'resource',
                treeId: `r${resourceId}`,
                id: parseInt(resourceId),
                scopeId: parseInt(scopeId),
              },
            ]
          : [];
      },
    },
  };
</script>

<style lang="scss" scoped>
  .search {
    padding-top: 6px;
    margin-bottom: 8px;
  }
</style>
