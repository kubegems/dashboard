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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-row>
      <v-col class="my-2">
        <v-text-field
          v-model="obj.name"
          class="my-4"
          flat
          :label="$t('tip.instance_name')"
          required
          :rules="objRules.nameRules"
        />
        <v-autocomplete
          v-model="obj.project"
          class="my-4"
          color="primary"
          hide-selected
          item-text="text"
          item-value="text"
          :items="m_select_tenantProjectItems"
          :label="$root.$t('resource.project')"
          :menu-props="{
            bottom: true,
            left: true,
            origin: `top center`,
          }"
          :no-data-text="$root.$t('data.no_data')"
          :rules="objRules.tenantProjectRules"
          @focus="onTenantProjectSelectFocus"
        >
          <template #selection="{ item }">
            <v-chip color="primary" small>
              {{ item.text }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col class="my-2">
        <v-autocomplete
          v-model="obj.version"
          class="my-4"
          color="primary"
          hide-selected
          :items="versionItems"
          :label="$t('tip.version')"
          :menu-props="{
            bottom: true,
            left: true,
            origin: `top center`,
          }"
          :no-data-text="$root.$t('data.no_data')"
          :rules="objRules.versionRules"
          @change="onAppVersionChange"
        >
          <template #selection="{ item }">
            <v-chip color="primary" small>
              {{ item.text }}
            </v-chip>
          </template>
        </v-autocomplete>

        <v-autocomplete
          v-model="obj.environment"
          class="my-4"
          color="primary"
          hide-selected
          item-value="environmentName"
          :items="m_select_projectEnvironmentItems"
          :label="$root.$t('resource.environment')"
          :menu-props="{
            bottom: true,
            left: true,
            origin: `top center`,
          }"
          :no-data-text="$root.$t('data.no_data')"
          :rules="objRules.environmentRules"
          @change="onEnvironmentChange"
          @focus="onEnvSelectFocus"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item.text }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import BasePermission from '@/mixins/permission';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'DeployBaseConf',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseSelect],
    props: {
      base: {
        type: Object,
        default: () => null,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        obj: {
          name: '',
          cluster: '',
          tenant: '',
          project: '',
          environment: '',
          version: '',
        },
        pluginsPass: false,
      };
    },
    computed: {
      ...mapState(['Auth']),
      objRules() {
        return {
          nameRules: [required, k8sName],
          versionRules: [required],
          tenantProjectRules: [required],
          environmentRules: [required, () => this.pluginsPass || this.$root.$t('plugin.environment_missing', [''])],
        };
      },
      projectId() {
        const pro = this.m_select_tenantProjectItems.find((p) => {
          return p.text === this.obj.project;
        });
        if (pro) return pro.value;
        return 0;
      },
      versionItems() {
        if (this.item) {
          return this.item.versions.map((v) => {
            return { text: v.name, value: v.name };
          });
        }
        return [];
      },
    },
    watch: {
      base: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onTenantProjectSelectFocus() {
        this.m_select_tenantProjectSelectData();
      },
      onAppVersionChange() {},
      async onEnvSelectFocus() {
        await this.m_select_projectEnvironmentSelectData(this.projectId);
        this.m_select_projectEnvironmentItems = this.m_select_projectEnvironmentItems.filter((projectEnv) => {
          return (
            this.m_permisson_tenantAllow ||
            this.Auth.projects.some((p) => {
              return p.isAdmin && p.id === this.projectId;
            }) ||
            this.Auth.environments.some((authEnv) => {
              return authEnv.isAdmin && authEnv.name === projectEnv.text;
            })
          );
        });
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation();
      },
      async onEnvironmentChange() {
        const env = this.m_select_projectEnvironmentItems.find((e) => {
          return e.environmentName === this.obj.environment;
        });
        if (env) {
          this.obj.cluster = env.clusterName;
          this.obj.namespace = env.namespace;
          const missingPlugins = await this.m_permission_plugin_pass(env.clusterName, []);
          if (missingPlugins?.length === 0) {
            this.pluginsPass = true;
          } else {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$root.$t('plugin.environment_missing', [missingPlugins.join(', ')]),
              color: 'warning',
            });
            this.pluginsPass = false;
          }
        }
      },
    },
  };
</script>
