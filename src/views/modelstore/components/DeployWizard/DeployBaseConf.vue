<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-row>
      <v-col class="my-2">
        <v-text-field v-model="obj.name" class="my-4" flat label="模型名称" required :rules="objRules.nameRules" />
        <v-autocomplete
          v-model="obj.project"
          class="my-4"
          color="primary"
          hide-selected
          item-text="text"
          item-value="text"
          :items="m_select_tenantProjectItems"
          label="项目"
          :menu-props="{
            bottom: true,
            left: true,
            origin: `top center`,
          }"
          no-data-text="暂无可选数据"
          :rules="objRules.tenantProjectRules"
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
          v-model="obj.version"
          class="my-4"
          color="primary"
          hide-selected
          :items="item ? item.versions : []"
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
          v-model="obj.environment"
          class="my-4"
          color="primary"
          hide-selected
          item-value="environmentName"
          :items="m_select_projectEnvironmentItems"
          label="环境"
          :menu-props="{
            bottom: true,
            left: true,
            origin: `top center`,
          }"
          no-data-text="暂无可选数据"
          :rules="objRules.environmentRules"
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
  import { mapState } from 'vuex';

  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'DeployBaseConf',
    mixins: [BaseSelect],
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
          tenant: '',
          project: '',
          environment: '',
          version: '',
        },
        objRules: {
          nameRules: [required, k8sName],
          versionRules: [required],
          tenantProjectRules: [required],
          environmentRules: [required],
        },
      };
    },
    computed: {
      ...mapState(['Auth']),
      projectId() {
        const pro = this.m_select_tenantProjectItems.find((p) => {
          return p.text === this.obj.project;
        });
        if (pro) return pro.value;
        return 0;
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
    },
  };
</script>
