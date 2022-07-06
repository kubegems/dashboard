<template>
  <v-form v-model="valid" lazy-validation @submit.prevent>
    <v-row>
      <v-col class="my-2">
        <v-text-field
          v-model="obj.AppName"
          class="my-4"
          flat
          label="应用名称"
          required
          :rules="objRules.appNameRules"
          @change="onAppNameChange"
        />
        <v-autocomplete
          v-model="obj.TenantProjectId"
          class="my-4"
          color="primary"
          hide-selected
          item-text="text"
          :items="m_select_tenantProjectItems"
          label="项目"
          :menu-props="{
            bottom: true,
            left: true,
            origin: `top center`,
          }"
          no-data-text="暂无可选数据"
          :rules="objRules.tenantProjectIdRules"
          @focus="onTenantProjectSelectFocus"
        >
          <template #selection="{ item }">
            <v-chip color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col class="my-2">
        <v-autocomplete
          v-model="obj.selectVersion"
          class="my-4"
          color="primary"
          hide-selected
          :items="versions"
          label="版本"
          :menu-props="{
            bottom: true,
            left: true,
            origin: `top center`,
          }"
          no-data-text="暂无可选数据"
          :rules="objRules.versionRules"
          @change="onAppVersionChange"
        >
          <template #selection="{ item }">
            <v-chip color="primary" small>
              {{ item }}
            </v-chip>
          </template>
        </v-autocomplete>

        <v-autocomplete
          v-model="obj.EnvironmentId"
          class="my-4"
          color="primary"
          hide-selected
          :items="m_select_projectEnvironmentItems"
          label="环境"
          :menu-props="{
            bottom: true,
            left: true,
            origin: `top center`,
          }"
          no-data-text="暂无可选数据"
          :rules="objRules.environmentIdRules"
          @focus="onEnvSelectFocus"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import BaseSelect from '@/mixins/select';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'DeployBaseConf',
    mixins: [BaseSelect],
    data() {
      return {
        valid: false,
        obj: {},
        objRules: {
          appNameRules: [required, k8sName],
          versionRules: [required],
          tenantProjectIdRules: [required],
          environmentIdRules: [required],
        },
      };
    },
    methods: {
      onTenantProjectSelectFocus() {
        this.m_select_tenantProjectSelectData();
      },
      onAppVersionChange() {},
      async onEnvSelectFocus() {
        await this.m_select_projectEnvironmentSelectData(this.obj.TenantProjectId);
        this.m_select_projectEnvironmentItems = this.m_select_projectEnvironmentItems.filter((projectEnv) => {
          return (
            this.m_permisson_tenantAllow ||
            this.Auth.projects.some((p) => {
              return p.isAdmin && p.id === this.obj.TenantProjectId;
            }) ||
            this.Auth.environments.some((authEnv) => {
              return authEnv.isAdmin && authEnv.name === projectEnv.text;
            })
          );
        });
      },
    },
  };
</script>
