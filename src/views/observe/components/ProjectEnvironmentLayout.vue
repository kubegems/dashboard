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
      >
        <div>集群：{{ env.clusterName }}</div>
        <div>项目：{{ env.projectName }}</div>
        <div>环境：{{ env.name }}</div>
        <div>命名空间：{{ env.namespace }}</div>
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
