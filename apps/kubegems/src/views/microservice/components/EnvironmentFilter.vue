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
    <v-sheet>
      <v-sheet :class="`text-subtitle-2 ml-${ml} mt-2 float-left kubegems__text font-weight-medium`">
        {{ $root.$t('resource.environment') }}
      </v-sheet>
      <v-sheet class="float-left" width="350">
        <v-combobox
          v-model="environmentFilter"
          chips
          class="ml-2"
          color="primary"
          dense
          flat
          full-width
          hide-details
          hide-selected
          :items="m_select_virtualSpaceEnvironmentItems"
          :label="$root.$t('resource.environment')"
          :no-data-text="$root.$t('data.no_data')"
          prepend-inner-icon="mdi-cube"
          solo
          @change="onEnvironmentFilterChange"
        >
          <template #selection="{ attrs, item, selected }">
            <v-chip v-if="environmentFilter" color="primary" :input-value="selected" label small v-bind="attrs">
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

  import messages from './i18n';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'EnvironmentFilter',
    i18n: {
      messages: messages,
    },
    mixins: [BaseSelect],
    inject: ['reload'],
    props: {
      ml: {
        type: Number,
        default: () => 4,
      },
    },
    data() {
      return {
        environmentFilter: null,
      };
    },
    computed: {
      ...mapState(['NamespaceFilter', 'EnvironmentFilter']),
      ...mapGetters(['VirtualSpace']),
      Environment() {
        if (!this.environmentFilter) return {};
        const env = this.m_select_virtualSpaceEnvironmentItems.find((e) => {
          return e.value === this.environmentFilter.value;
        });
        if (env) return env;
        return {};
      },
      EnvironmentFormNS() {
        const env = this.m_select_virtualSpaceEnvironmentItems.find((e) => {
          return this.NamespaceFilter && e.namespace === this.NamespaceFilter.Namespace;
        });
        if (env) return env;
        return {};
      },
    },
    async mounted() {
      await this.m_select_virtualSpaceEnvironmentSelectData(this.VirtualSpace().ID);
      if (!this.NamespaceFilter) {
        if (this.$route.query.namespace) {
          this.$store.commit('SET_NAMESPACE_FILTER', {
            Namespace: this.$route.query.namespace,
            Mounted: true,
          });
          this.$store.commit('SET_ENVIRONMENT_FILTER', this.EnvironmentFormNS);
        } else if (this.m_select_virtualSpaceEnvironmentItems.length > 0) {
          const env = this.m_select_virtualSpaceEnvironmentItems[0];
          this.$store.commit('SET_NAMESPACE_FILTER', {
            Namespace: env.namespace,
            Mounted: true,
          });
          this.$store.commit('SET_ENVIRONMENT_FILTER', env);
        }
      }
      this.$router.replace({
        query: {
          ...this.$route.query,
          ...{
            namespace: this.NamespaceFilter ? this.NamespaceFilter.Namespace : '',
            environmentid: this.EnvironmentFormNS.value,
            clusterid: this.EnvironmentFormNS.clusterid,
            page: 1,
            cluster: this.EnvironmentFormNS.cluster,
          },
        },
      });
      if (this.NamespaceFilter) {
        this.environmentFilter = {
          text: this.EnvironmentFormNS.text,
          value: this.EnvironmentFormNS.value,
        };
      }
    },
    methods: {
      onEnvironmentFilterChange() {
        const namespace = this.Environment.namespace;
        if (namespace) {
          this.$store.commit('SET_NAMESPACE_FILTER', {
            Namespace: namespace,
            Mounted: false,
          });
          this.$store.commit('SET_ENVIRONMENT_FILTER', this.Environment);
          this.$router.replace({
            query: {
              ...this.$route.query,
              ...{
                namespace: namespace,
                environmentid: this.Environment.value,
                clusterid: this.Environment.clusterid,
                cluster: this.Environment.cluster,
              },
              ...{ page: 1 },
            },
          });
        } else {
          this.environmentFilter = null;
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_environment'),
            color: 'warning',
          });
        }
      },
    },
  };
</script>
