<template>
  <v-container fluid>
    <BaseSplitContainer
      title="项目环境"
      side-width="300px"
      :tooltip="!!env"
    >
      <ProjectEnvironmentTree
        slot="side"
        v-model="env"
        @change="onEnvChange"
      />

      <div
        v-if="!!env"
        slot="tooltip"
        class="text-caption"
        :style="{ maxWidth: '200px' }"
      >
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon
            color="white"
            left
            small
          >
            mdi-cloud
          </v-icon>
          <span>环境信息</span>
        </v-flex>
        <v-list
          dense
          class="pa-0 kubegems__tip"
        >
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>集群</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__detail">
                {{ env.clusterName }}
              </v-list-item-content>
              <v-list-item-title>项目</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__detail">
                {{ env.projectName }}
              </v-list-item-content>
              <v-list-item-title>环境</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__detail my-0">
                {{ env.name }}
              </v-list-item-content>
              <v-list-item-title>命名空间</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__detail my-0">
                {{ env.namespace }}
              </v-list-item-content>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
      <EmptyOverlay :visible="!env" />

      <slot />
    </BaseSplitContainer>
  </v-container>
</template>

<script>
import ProjectEnvironmentTree from '@/views/observe/components/ProjectEnvironmentTree'
import EmptyOverlay from '@/views/observe/components/EmptyOverlay'

export default {
  name: 'ProjectEnvironmentLayout',
  components: {
    ProjectEnvironmentTree,
    EmptyOverlay,
  },
  data () {
    return {
      env: undefined,
    }
  },
  methods: {
    onEnvChange (env) {
      this.$router.replace({
        query: {
          ...this.$route.query,
          proj: env?.projectName,
          env: env?.name,
          cluster: env?.clusterName,
          namespace: env?.namespace,
        },
      })
    },
  },
}
</script>
