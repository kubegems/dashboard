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
  <v-sheet>
    <v-sheet v-if="AdminViewport">
      <v-sheet class="text-subtitle-2 ml-4 mr-2 float-left font-weight-medium kubegems__text font-line-height ns__tip">
        {{ $t('resource.namespace') }}
      </v-sheet>
      <v-sheet class="float-left ns__combox" width="400">
        <v-combobox
          v-model="namespaceFilter"
          chips
          color="primary"
          dense
          flat
          full-width
          hide-details
          hide-selected
          :items="m_select_namespaceItems"
          :label="$t('resource.namespace')"
          :no-data-text="$t('data.no_data')"
          prepend-inner-icon="mdi-cube"
          solo
          @change="onNamespaceFilterChange"
          @focus="onNamespaceSelectFocus(Cluster().ClusterName)"
        >
          <template #selection="{ item, selected }">
            <v-chip
              v-if="namespaceFilter"
              close
              close-icon="mdi-close-circle"
              color="primary"
              :input-value="selected"
              label
              small
              @click:close="removeNamespaceFilter"
            >
              <span class="pr-2">{{ item.text }}</span>
            </v-chip>
          </template>
        </v-combobox>
      </v-sheet>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <div class="kubegems__clear-float" />
  </v-sheet>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import BaseSelect from '@/mixins/select';

  export default {
    name: 'NamespaceFilter',
    mixins: [BaseSelect],
    inject: ['reload'],
    data() {
      return {
        namespaceFilter: null,
      };
    },
    computed: {
      ...mapState(['NamespaceFilter', 'AdminViewport']),
      ...mapGetters(['Cluster', 'Environment']),
    },
    mounted() {
      if (this.NamespaceFilter) {
        this.$router.replace({
          query: {
            ...this.$route.query,
            ...{ namespace: this.NamespaceFilter.Namespace, page: 1 },
          },
        });
      }
      if (this.$route.query.namespace) {
        this.$store.commit('SET_NAMESPACE_FILTER', {
          Namespace: this.$route.query.namespace,
          Mounted: true,
        });
      }
      if (this.NamespaceFilter) {
        this.namespaceFilter = {
          text: this.NamespaceFilter.Namespace,
          value: this.NamespaceFilter.Namespace,
        };
      }
    },
    methods: {
      onNamespaceFilterChange() {
        const namespace = this.m_select_namespaceItems.find((n) => {
          return this.namespaceFilter && n.value === this.namespaceFilter.value;
        });
        if (namespace) {
          this.$router.replace({
            query: {
              ...this.$route.query,
              ...{ namespace: namespace.text },
              ...{ page: 1 },
            },
          });
          this.$store.commit('SET_NAMESPACE_FILTER', {
            Namespace: namespace.text,
            Mounted: false,
          });
        } else {
          this.namespaceFilter = null;
          this.removeNamespaceFilter();
        }
      },
      async removeNamespaceFilter() {
        this.$store.commit('SET_NAMESPACE_FILTER', null);
        this.namespaceFilter = '';
        await this.$router.replace({
          query: {
            ...this.$route.query,
            ...{ namespace: null },
          },
        });
        this.reload();
      },
      onNamespaceSelectFocus(clusterName) {
        this.m_select_namespaceSelectData(clusterName, { noprocessing: true });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .font-line-height {
    line-height: 40px;
  }

  .ns__tip {
    display: block;

    @media (max-width: 1300px) {
      display: none;
    }
  }

  .ns__combox {
    @media (max-width: 1300px) {
      margin-top: 4px;
      width: 700px;
    }
  }
</style>
