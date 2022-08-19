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
  <v-row>
    <v-col cols="6">
      <v-autocomplete
        v-model="projectId"
        class="my-0"
        color="primary"
        hide-selected
        item-text="projectName"
        :items="m_select_projectItems"
        :label="$root.$t('resource.project')"
        :menu-props="{
          bottom: true,
          left: true,
          origin: `top center`,
        }"
        :no-data-text="$root.$t('data.no_data')"
        @change="onProjectChange"
      >
        <template #selection="{ item }">
          <v-chip class="mx-1" color="primary" small>
            {{ item['projectName'] }}
          </v-chip>
        </template>
      </v-autocomplete>
    </v-col>
    <v-col cols="6">
      <v-autocomplete
        v-model="environmentId"
        class="my-0"
        color="primary"
        hide-selected
        item-text="environmentName"
        :items="m_select_projectEnvironmentItems"
        :label="$root.$t('resource.environment')"
        :menu-props="{
          bottom: true,
          left: true,
          origin: `top center`,
        }"
        :no-data-text="$root.$t('data.no_data')"
        @change="onEnvironmentChange"
      >
        <template #selection="{ item }">
          <v-chip class="mx-1" color="primary" :disabled="item.disabled" small>
            {{ item['text'] }}
          </v-chip>
        </template>
      </v-autocomplete>
    </v-col>
  </v-row>
</template>

<script>
  import messages from '../../i18n';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ProjectEnvSelect',
    i18n: {
      messages: messages,
    },
    mixins: [BaseSelect],
    props: {
      t: {
        type: String,
        default: () => 'trace',
      },
    },
    data() {
      return {
        projectId: undefined,
        environmentId: undefined,
        env: undefined,
      };
    },
    watch: {
      value: {
        handler(newValue) {
          this.env = newValue;
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.m_select_projectSelectData();
      });
    },
    methods: {
      async onProjectChange() {
        await this.m_select_projectEnvironmentSelectData(this.projectId, false, true, false);
        if (this.t === 'logging') {
          this.m_select_projectEnvironmentItems = this.m_select_projectEnvironmentItems.map((e) => {
            if (e.nsLabels && e.nsLabels['gems.kubegems.io/logging'] === 'enabled') {
              e.disabled = true;
              e.environmentName = `${e.environmentName}(${this.$t('tip.added_log_collect')})`;
            }
            return { ...e };
          });
        }
      },
      onEnvironmentChange() {
        this.env = this.m_select_projectEnvironmentItems.find((e) => {
          return e.value === this.environmentId;
        });
        this.$emit('input', this.env);
        this.$emit('change', this.env);
      },
    },
  };
</script>
