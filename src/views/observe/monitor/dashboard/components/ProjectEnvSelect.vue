<template>
  <div>
    <v-sheet
      class="
          text-subtitle-2
          float-left
          font-weight-medium
          kubegems__detail
          sheet__line
        "
    >
      项目
    </v-sheet>
    <v-sheet
      class="float-left"
      width="350"
    >
      <v-autocomplete
        v-model="project"
        color="primary"
        chips
        hide-selected
        hide-details
        label="项目"
        item-text="projectName"
        item-value="projectName"
        prepend-inner-icon="mdi-cube"
        dense
        solo
        flat
        no-data-text="无数据"
        full-width
        class="ml-2"
        :items="m_select_projectItems"
        @focus="m_select_projectSelectData(true)"
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
    </v-sheet>

    <v-sheet
      class="
          text-subtitle-2
          ml-4
          float-left
          font-weight-medium
          kubegems__detail
          sheet__line
        "
    >
      环境
    </v-sheet>
    <v-sheet
      class="float-left"
      width="350"
    >
      <v-autocomplete
        v-model="environment"
        color="primary"
        chips
        hide-selected
        hide-details
        label="环境"
        item-text="environmentName"
        item-value="environmentName"
        prepend-inner-icon="mdi-cloud"
        dense
        solo
        flat
        no-data-text="无数据"
        full-width
        class="ml-2"
        :items="m_select_projectEnvironmentItems"
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
    </v-sheet>

    <div class="kubegems__clear-float" />
  </div>
</template>

<script>
import BaseSelect from '@/mixins/select'

export default {
  name: 'ProjectEnvSelect',
  mixins: [BaseSelect],
  data() {
    return {
      project: undefined,
      environment: undefined,
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
      await this.m_select_projectSelectData(true)
      if (this.m_select_projectItems?.length > 0) {
        this.project = this.m_select_projectItems[0].projectName
        await this.m_select_projectEnvironmentSelectData(this.projectid)
        if (this.m_select_projectEnvironmentItems?.length > 0) {
          this.environment = this.m_select_projectEnvironmentItems[0].environmentName
          this.$emit('refreshEnvironemnt', this.environemtObj)
        }
      }
    })
  },
  methods: {
    onProjectChange() {
      this.environment = ''
      this.m_select_projectEnvironmentItems = []
    },
    onEnvironmentChange() {
      if (this.environment) {
        this.$emit('refreshEnvironemnt', this.environemtObj)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.sheet {
  &__line {
    line-height: 40px;
  }
}
</style>
