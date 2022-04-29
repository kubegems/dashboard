<template>
  <v-row>
    <v-col cols="6">
      <v-autocomplete
        v-model="projectId"
        :items="m_select_projectItems"
        color="primary"
        label="项目"
        hide-selected
        class="my-0"
        no-data-text="暂无可选数据"
        :menu-props="{
          bottom: true,
          left: true,
          origin: `top center`,
        }"
        item-text="projectName"
        @change="onProjectChange"
      >
        <template #selection="{ item }">
          <v-chip
            color="primary"
            small
            class="mx-1"
          >
            {{ item['projectName'] }}
          </v-chip>
        </template>
      </v-autocomplete>
    </v-col>
    <v-col cols="6">
      <v-autocomplete
        v-model="environmentId"
        :items="m_select_projectEnvironmentItems"
        color="primary"
        label="环境"
        hide-selected
        class="my-0"
        no-data-text="暂无可选数据"
        :menu-props="{
          bottom: true,
          left: true,
          origin: `top center`,
        }"
        item-text="environmentName"
        @change="onEnvironmentChange"
      >
        <template #selection="{ item }">
          <v-chip
            color="primary"
            small
            class="mx-1"
          >
            {{ item['text'] }}
          </v-chip>
        </template>
      </v-autocomplete>
    </v-col>
  </v-row>
</template>

<script>
import BaseSelect from '@/mixins/select'

export default {
  name: 'ProjectEnvSelect',
  mixins: [BaseSelect],
  data() {
    return {
      projectId: undefined,
      environmentId: undefined,
      env: undefined,
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.env = newValue
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.m_select_projectSelectData()
    })
  },
  methods: {
    onProjectChange() {
      this.m_select_projectEnvironmentSelectData(this.projectId, false, false)
    },
    onEnvironmentChange() {
      this.env = this.m_select_projectEnvironmentItems.find(e => { return e.value === this.environmentId })
      this.$emit('input', this.env)
      this.$emit('change', this.env)
    },
  },
}
</script>

