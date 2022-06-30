<template>
  <div class="float-left">
    <v-sheet
      :class="`text-subtitle-2 ml-4 float-left font-weight-medium ${
        reverse ? 'sheet__reverse__line white--text primary' : 'sheet__line kubegems__text'
      }`"
    >
      项目
    </v-sheet>
    <v-sheet :class="`text-body-2 float-left text--darken-1 ${reverse || 'sheet__menu__line'}`">
      <v-menu
        v-model="projectMenu"
        bottom
        left
        max-height="300px"
        max-width="220px"
        min-width="120px"
        nudge-bottom="5px"
        offset-y
        origin="top center"
        transition="scale-transition"
      >
        <template #activator="{ on }">
          <v-btn
            :class="`${reverse ? 'white--text' : 'primary--text'} font-weight-medium`"
            :color="reverse ? 'primary rounded-0' : 'white'"
            dark
            depressed
            small
            v-on="on"
          >
            {{ projectName }}
            <v-icon v-if="projectMenu" right> fas fa-angle-up </v-icon>
            <v-icon v-else right> fas fa-angle-down </v-icon>
          </v-btn>
        </template>
        <v-data-iterator hide-default-footer :items="[{ text: '项目', values: m_select_projectItems }]">
          <template #no-data>
            <v-card>
              <v-card-text> 暂无项目 </v-card-text>
            </v-card>
          </template>
          <template #default="props">
            <v-card v-for="item in props.items" :key="item.text" min-width="100px">
              <v-list dense>
                <v-flex class="text-subtitle-2 text-center ma-2">
                  <span>项目</span>
                </v-flex>
                <v-divider class="mx-2" />
                <v-list-item
                  v-for="(project, index) in item.values"
                  :key="index"
                  class="text-body-2 text-center font-weight-medium mx-2"
                  link
                  :style="project.projectName === projectName ? `color: #1e88e5 !important;` : ``"
                  @click="setProject(project)"
                >
                  <v-list-item-content>
                    <span>{{ project.projectName }}</span>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </template>
        </v-data-iterator>
      </v-menu>
    </v-sheet>

    <v-sheet
      :class="`text-subtitle-2 ml-4 float-left font-weight-medium ${
        reverse ? 'sheet__reverse__line white--text primary' : 'sheet__line kubegems__text'
      }`"
    >
      环境
    </v-sheet>
    <v-sheet :class="`text-body-2 float-left text--darken-1 ${reverse || 'sheet__menu__line'}`">
      <v-menu
        v-model="environmentMenu"
        bottom
        left
        max-height="300px"
        max-width="220px"
        min-width="120px"
        nudge-bottom="5px"
        offset-y
        origin="top center"
        transition="scale-transition"
      >
        <template #activator="{ on }">
          <v-btn
            :class="`${reverse ? 'white--text' : 'primary--text'} font-weight-medium`"
            :color="reverse ? 'primary rounded-0' : 'white'"
            dark
            depressed
            small
            v-on="on"
          >
            {{ environmentName }}
            <v-icon v-if="environmentMenu" right> fas fa-angle-up </v-icon>
            <v-icon v-else right> fas fa-angle-down </v-icon>
          </v-btn>
        </template>
        <v-data-iterator hide-default-footer :items="[{ text: '环境', values: m_select_projectEnvironmentItems }]">
          <template #no-data>
            <v-card>
              <v-card-text> 暂无环境 </v-card-text>
            </v-card>
          </template>
          <template #default="props">
            <v-card v-for="item in props.items" :key="item.text" min-width="100px">
              <v-list dense>
                <v-flex class="text-subtitle-2 text-center ma-2">
                  <span>环境</span>
                </v-flex>
                <v-divider class="mx-2" />
                <v-list-item
                  v-for="(environment, index) in item.values"
                  :key="index"
                  class="text-body-2 text-center font-weight-medium mx-2"
                  link
                  :style="environment.environmentName === environmentName ? `color: #1e88e5 !important;` : ``"
                  @click="setEnvironment(environment)"
                >
                  <v-list-item-content>
                    <span>{{ environment.environmentName }}</span>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </template>
        </v-data-iterator>
      </v-menu>
    </v-sheet>
  </div>
</template>

<script>
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ProjectEnvSelect',
    mixins: [BaseSelect],
    props: {
      reverse: {
        type: Boolean,
        default: () => false,
      },
      tenant: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        project: undefined,
        projectName: '',
        projectMenu: false,
        environment: undefined,
        environmentName: '',
        environmentMenu: false,
      };
    },
    watch: {
      tenant: {
        handler: async function (newValue) {
          if (newValue) {
            await this.m_select_projectSelectData(newValue.ID, true);
            if (this.m_select_projectItems?.length > 0) {
              this.project = this.m_select_projectItems[0];
              this.projectName = this.project.projectName;
              this.loadEnvironment();
            }
          }
        },
        deep: true,
      },
    },
    methods: {
      async loadEnvironment() {
        await this.m_select_projectEnvironmentSelectData(this.project.value);
        if (this.m_select_projectEnvironmentItems?.length > 0) {
          this.environment = this.m_select_projectEnvironmentItems[0];
          this.environmentName = this.environment.environmentName;
          this.$emit('refreshEnvironemnt', this.environment);
        }
      },
      setProject(project) {
        this.project = project;
        this.environment = undefined;
        this.m_select_projectEnvironmentItems = [];
        this.loadEnvironment();
      },
      setEnvironment(environment) {
        if (environment && environment.environmentName !== this.environmentName) {
          this.environmentName = this.environment.environmentName;
          this.$emit('refreshEnvironemnt', this.environment);
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .sheet {
    &__line {
      line-height: 40px;
    }

    &__reverse__line {
      line-height: 30px;
    }

    &__menu {
      &__line {
        line-height: 34px;
      }
    }
  }
</style>
