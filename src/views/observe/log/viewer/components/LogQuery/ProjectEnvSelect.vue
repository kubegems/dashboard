<template>
  <div>
    <v-flex class="d-flex" :style="{ display: 'inline-flex !important' }">
      <v-autocomplete
        v-model="project"
        chips
        dense
        flat
        hide-details
        item-text="projectName"
        item-value="projectName"
        :items="m_select_projectItems"
        label="项目"
        no-data-text="暂无数据"
        small-chips
        solo
        style="width: 300px"
        @change="onProjectChange"
        @focus="m_select_projectSelectData(null, true)"
      >
        <template #selection="{ item }">
          <v-chip color="primary" label small>
            <span>项目：{{ item.projectName }}</span>
          </v-chip>
        </template>
      </v-autocomplete>

      <v-autocomplete
        v-model="environment"
        chips
        class="ml-2"
        dense
        flat
        hide-details
        item-text="environmentName"
        item-value="environmentName"
        :items="m_select_projectEnvironmentItems"
        label="环境"
        no-data-text="暂无数据"
        small-chips
        solo
        style="width: 300px"
        @change="onEnvironmentChange"
        @focus="m_select_projectEnvironmentSelectData(projectid)"
      >
        <template #selection="{ item }">
          <v-chip color="primary" label small>
            <span>环境：{{ item.environmentName }}</span>
          </v-chip>
        </template>
      </v-autocomplete>

      <v-sheet class="tip">
        <v-icon right small> fas fa-question-circle </v-icon>
      </v-sheet>

      <v-sheet class="text-body-2 ml-2" :style="{ lineHeight: '36px' }">
        <v-btn bottom color="primary" small text @click="handleRefresh"> 刷新 </v-btn>
      </v-sheet>

      <v-sheet class="text-body-2 ml-2" :style="{ lineHeight: '36px' }">
        <v-btn bottom color="error" small text @click="handleClear"> 清空 </v-btn>
      </v-sheet>

      <v-sheet v-if="loading" class="tip ml-2">
        <v-progress-circular color="primary" indeterminate size="20" :width="3" />
      </v-sheet>
    </v-flex>

    <v-flex :style="{ display: 'inline-flex !important', float: 'right' }">
      <v-sheet class="text-body-2 tip ml-6 kubegems__text">
        集群:
        <span class="text-body-2 font-weight-medium">
          {{ environemtObj ? environemtObj.clusterName : '' }}
        </span>
      </v-sheet>
      <v-sheet class="text-body-2 tip ml-4 kubegems__text">
        命名空间:
        <span class="text-body-2 font-weight-medium">
          {{ environemtObj ? environemtObj.namespace : '' }}
        </span>
      </v-sheet>

      <v-sheet class="text-body-2 tip ml-4 kubegems__text">
        series:
        <span class="text-body-2 font-weight-medium">
          {{ series.length > 5000 ? '5000+' : series.length }}
        </span>
      </v-sheet>
    </v-flex>
  </div>
</template>

<script>
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ProjectEnvSelect',
    mixins: [BaseSelect],
    props: {
      loading: {
        type: Boolean,
        default: () => false,
      },
      series: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        project: '',
        environment: '',
      };
    },
    computed: {
      projectid() {
        const p = this.m_select_projectItems.find((p) => {
          return p.projectName === this.project;
        });
        if (p) return p.value;
        return null;
      },
      environemtObj() {
        const e = this.m_select_projectEnvironmentItems.find((p) => {
          return p.environmentName === this.environment;
        });
        if (e) return e;
        return null;
      },
    },
    mounted() {
      this.$nextTick(async () => {
        if (this.$route.query.project) {
          this.project = this.$route.query.project;
          await this.m_select_projectSelectData(null, true);
          if (this.$route.query.environment) {
            this.environment = this.$route.query.environment;
            await this.m_select_projectEnvironmentSelectData(this.projectid);
            this.$emit('setEnvironment', this.environemtObj, this.project, true);
          }
        }
      });
    },
    methods: {
      onProjectChange() {
        this.environment = '';
        this.m_select_projectEnvironmentItems = [];
        this.$emit('clearProject');
      },
      onEnvironmentChange() {
        if (this.environment) {
          this.$emit('setEnvironment', this.environemtObj, this.project);
        }
      },
      handleClear() {
        this.$emit('clear');
      },

      handleRefresh() {
        if (this.environment) {
          this.$emit('refresh');
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .tip {
    line-height: 38px;
  }
</style>
