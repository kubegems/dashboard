<template>
  <div class="float-left">
    <v-sheet class="text-subtitle-2 float-left font-weight-medium kubegems__text sheet__line"> 项目 </v-sheet>
    <v-sheet class="text-body-2 float-left text--darken-1 sheet__menu__line">
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
          <v-btn class="primary--text font-weight-medium" color="white" dark depressed small v-on="on">
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

    <v-sheet class="text-subtitle-2 ml-4 float-left font-weight-medium kubegems__text sheet__line"> 环境 </v-sheet>
    <v-sheet class="text-body-2 float-left text--darken-1 sheet__menu__line">
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
          <v-btn class="primary--text font-weight-medium" color="white" dark depressed small v-on="on">
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

    <template v-if="showPod">
      <v-sheet class="text-subtitle-2 ml-4 float-left font-weight-medium kubegems__text sheet__line"> 容器组 </v-sheet>
      <v-sheet class="text-body-2 float-left text--darken-1 sheet__menu__line">
        <v-menu
          v-model="podMenu"
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
            <v-btn class="primary--text font-weight-medium" color="white" dark depressed small v-on="on">
              {{ podName }}
              <v-icon v-if="podMenu" right> fas fa-angle-up </v-icon>
              <v-icon v-else right> fas fa-angle-down </v-icon>
            </v-btn>
          </template>
          <v-data-iterator hide-default-footer :items="[{ text: '容器组', values: podItems }]">
            <template #no-data>
              <v-card>
                <v-card-text> 暂无容器组 </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text" min-width="100px">
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>容器组</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <v-list-item
                    v-for="(pod, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center font-weight-medium mx-2"
                    link
                    :style="pod.podName === podName ? `color: #1e88e5 !important;` : ``"
                    @click="setPod(pod)"
                  >
                    <v-list-item-content>
                      <span>{{ pod.podName }}</span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
    </template>
  </div>
</template>

<script>
  import { getPodList } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ProjectEnvSelect',
    mixins: [BaseSelect],
    props: {
      tenant: {
        type: Object,
        default: () => null,
      },
      showPod: {
        type: Boolean,
        default: () => false,
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
        pod: undefined,
        podName: '',
        podMenu: false,

        podItems: [],
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
          this.pod = undefined;
          if (this.showPod) this.loadPod();
        }
      },
      async loadPod() {
        const data = await getPodList(this.environment?.clusterName, this.environment?.namespace, {
          noprocessing: true,
          size: 1000,
        });
        if (data?.List) {
          this.podItems = data.List.map((d) => {
            return {
              podName: d.metadata.name,
              value: d.metadata.name,
            };
          });
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
          this.pod = undefined;
          if (this.showPod) this.loadPod();
        }
      },
      setPod(pod) {
        this.pod = pod;
        this.podName = pod.podName;
        this.$emit('filterPod', this.pod);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .sheet {
    &__line {
      line-height: 40px;
    }
    &__menu {
      &__line {
        line-height: 34px;
      }
    }
  }
</style>
