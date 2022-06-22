<template>
  <v-container fluid>
    <BaseSplitContainer side-width="250px" title="项目环境" :tooltip="!!env">
      <ProjectEnvironmentTree slot="side" v-model="env" @change="onEnvChange" />

      <div v-if="!!env" slot="tooltip" class="text-caption" :style="{ maxWidth: '200px' }">
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small> mdi-cloud </v-icon>
          <span>环境信息</span>
        </v-flex>
        <v-list class="pa-0 kubegems__tip" dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>集群</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text">
                {{ env.clusterName }}
              </v-list-item-content>
              <v-list-item-title>项目</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text">
                {{ env.projectName }}
              </v-list-item-content>
              <v-list-item-title>环境</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text my-0">
                {{ env.name }}
              </v-list-item-content>
              <v-list-item-title>命名空间</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text my-0">
                {{ env.namespace }}
              </v-list-item-content>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
      <EmptyOverlay :visible="!env" />

      <slot v-if="missingPlugins.length === 0" />
      <v-card v-else class="mx-3" flat :height="`400px`">
        <v-row :style="{ height: `400px` }">
          <v-col class="d-flex align-center justify-center">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h5 primary--text font-weight-medium">
                  该环境所在集群暂时还未启用 {{ missingPlugins.join(', ') }} 插件！
                </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  您可以联系平台管理员启用该插件
                </h6>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </BaseSplitContainer>
  </v-container>
</template>

<script>
  import BasePermission from '@/mixins/permission';
  import EmptyOverlay from '@/views/observe/components/EmptyOverlay';
  import ProjectEnvironmentTree from '@/views/observe/components/ProjectEnvironmentTree';

  export default {
    name: 'ProjectEnvironmentLayout',
    components: {
      EmptyOverlay,
      ProjectEnvironmentTree,
    },
    mixins: [BasePermission],
    data() {
      return {
        env: undefined,
        missingPlugins: [],
        pass: false,
      };
    },
    watch: {
      value: {
        handler(newValue) {
          this.value = newValue;
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async onEnvChange(env) {
        if (env?.clusterName) {
          this.missingPlugins = await this.m_permission_plugin_pass(
            env?.clusterName,
            this.$route.meta?.dependencies || [],
          );
        } else {
          this.missingPlugins = [];
        }

        if (this.missingPlugins?.length === 0) {
          this.$router.replace({
            query: {
              ...this.$route.query,
              proj: env?.projectName,
              env: env?.name,
              envid: env?.id,
              projid: env?.projectId,
              cluster: env?.clusterName,
              namespace: env?.namespace,
            },
          });
          this.pass = true;
          this.$emit('input', this.pass);
          this.$emit('change', this.pass);
        }
      },
    },
  };
</script>
