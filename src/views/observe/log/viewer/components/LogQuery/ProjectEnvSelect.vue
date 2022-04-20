<template>
  <v-flex class="d-flex">
    <v-autocomplete
      v-model="project"
      :items="m_select_projectItems"
      item-text="projectName"
      item-value="projectName"
      style="width: 150px;"
      dense
      chips
      small-chips
      label="项目"
      solo
      flat
      hide-details
      no-data-text="暂无数据"
      @focus="m_select_projectSelectData"
      @change="onProjectChange"
    >
      <template #selection="{ item }">
        <v-chip
          color="primary"
          small
          label
        >
          <span>项目：{{ item.projectName }}</span>
        </v-chip>
      </template>
    </v-autocomplete>

    <v-autocomplete
      v-model="environment"
      :items="m_select_projectEnvironmentItems"
      item-text="environmentName"
      item-value="environmentName"
      style="width: 150px;"
      class="ml-2"
      dense
      chips
      small-chips
      label="环境"
      solo
      flat
      hide-details
      no-data-text="暂无数据"
      @focus="m_select_projectEnvironmentSelectData(projectid)"
      @change="onEnvironmentChange"
    >
      <template #selection="{ item }">
        <v-chip
          color="primary"
          small
          label
        >
          <span>环境：{{ item.environmentName }}</span>
        </v-chip>
      </template>
    </v-autocomplete>

    <v-sheet class="tip">
      <v-icon
        right
        small
      >
        fas fa-question-circle
      </v-icon>
    </v-sheet>

    <v-sheet
      class="text-body-2 ml-2"
      :style="{ lineHeight: '36px' }"
    >
      <v-btn
        small
        bottom
        text
        color="error"
        @click="handleClear"
      >
        清空
      </v-btn>
    </v-sheet>

    <v-sheet
      class="text-body-2 tip ml-6 kubegems__detail"
    >
      集群:
      <span class="text-body-2 font-weight-medium">
        {{ environemtObj ? environemtObj.clusterName : '' }}
      </span>
    </v-sheet>
    <v-sheet
      class="text-body-2 tip ml-4 kubegems__detail"
    >
      命名空间:
      <span class="text-body-2 font-weight-medium">
        {{ environemtObj ? environemtObj.namespace : '' }}
      </span>
    </v-sheet>

    <v-sheet
      class="text-body-2 tip ml-4 kubegems__detail"
    >
      series:
      <span class="text-body-2 font-weight-medium">
        {{ series.length>5000 ? '5000+' : series.length }}
      </span>
    </v-sheet>

    <v-spacer />
    <v-spacer />
    <v-spacer />
    <v-spacer />
  </v-flex>
</template>

<script>
import BaseSelect from '@/mixins/select'

export default {
  name: 'ProjectEnvSelect',
  mixins: [BaseSelect],
  props: {
    series: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      project: '',
      environment: '',
    }
  },
  computed: {
    projectid() {
      const p = this.m_select_projectItems.find(p => { return p.projectName === this.project })
      if (p) return p.value
      return null
    },
    environemtObj() {
      const e = this.m_select_projectEnvironmentItems.find(p => { return p.environmentName === this.environment })
      if (e) return e
      return null
    },
  },
  mounted() {
    this.$nextTick(async () => {
      if (this.$route.query.project) {
        this.project = this.$route.query.project
        await this.m_select_projectSelectData()
        if (this.$route.query.environment) {
          this.environment = this.$route.query.environment
          await this.m_select_projectEnvironmentSelectData(this.projectid)
          this.$emit('setEnvironment', this.environemtObj, this.project, true)
        }
      }
    })
  },
  methods: {
    onProjectChange() {
      this.environment = ''
      this.m_select_projectEnvironmentItems = []
      this.$emit('clearProject')
    },
    onEnvironmentChange() {
      if (this.environment) {
        this.$emit('setEnvironment', this.environemtObj, this.project)
      }
    },
    handleClear() {
      this.$emit('clear')
    },
  },
}
</script>

<style lang="scss" scoped>
.tip {
  line-height: 38px;
}
</style>
