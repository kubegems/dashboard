<template>
  <div>
    <v-sheet
      class="
          text-subtitle-2
          float-left
          font-weight-medium
          kubegems__text
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
        @change="onProjectChange"
      >
        <template #selection="{ item }">
          <v-chip
            color="primary"
            small
            label
          >
            <span>{{ item.projectName }}</span>
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
          kubegems__text
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
            <span>{{ item.environmentName }}</span>
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
  props: {
    tenant: {
      type: Object,
      default: () => null,
    },
  },
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
  watch: {
    tenant: {
      handler: async function (newValue) {
        if (newValue) {
          await this.m_select_projectSelectData(newValue.ID, true)
          if (this.m_select_projectItems?.length > 0) {
            this.project = this.m_select_projectItems[0].projectName
            this.loadEnvironment()
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    async loadEnvironment() {
      await this.m_select_projectEnvironmentSelectData(this.projectid)
      if (this.m_select_projectEnvironmentItems?.length > 0) {
        this.environment = this.m_select_projectEnvironmentItems[0].environmentName
        this.$emit('refreshEnvironemnt', this.environemtObj)
      }
    },
    onProjectChange() {
      this.environment = ''
      this.m_select_projectEnvironmentItems = []
      this.loadEnvironment()
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
