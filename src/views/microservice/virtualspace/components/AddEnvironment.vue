<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="关联环境"
    icon="mdi-link"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle title="环境定义" />
      <v-card-text class="pa-2 mt-2">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-sheet>
            <v-autocomplete
              v-model="obj.projectid"
              :rules="objRules.projectIDRules"
              :items="projectSelect"
              color="primary"
              :label="Admin ? `租户(项目)` : `项目`"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @focus="onProjectSelectFocus"
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
            <v-autocomplete
              v-model="obj.environmentid"
              :rules="objRules.environmentIDRules"
              :items="projectEnvironmentSelect"
              color="primary"
              label="环境"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @focus="onProjectEnvironmentSelectFocus(obj.projectid, true)"
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
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addVirtualSpaceEnvironment"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postAddVirtualSpaceEnvironment } from '@/api'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { required } from '@/utils/rules'

export default {
  name: 'AddEnvironment',
  mixins: [BaseSelect, BaseResource],
  data: () => ({
    dialog: false,
    valid: false,
    obj: {
      projectid: null,
      environmentid: null,
    },
    objRules: {
      projectIDRules: [required],
      environmentIDRules: [required],
    },
  }),
  computed: {
    ...mapState(['Circular', 'Admin']),
    ...mapGetters(['VirtualSpace']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addVirtualSpaceEnvironment() {
      if (this.$refs.form.validate(true)) {
        await postAddVirtualSpaceEnvironment(this.VirtualSpace().ID, {
          VirtualSpaceID: this.VirtualSpace().ID,
          ID: this.obj.environmentid,
        })
        this.reset()
        this.$emit('refresh')
      }
    },
    reset() {
      this.dialog = false
      this.$refs.form.reset()
    },
    onProjectSelectFocus() {
      this.projectSelectData()
    },
    onProjectEnvironmentSelectFocus(projectid, vs = true) {
      this.projectEnvironmentSelectData(projectid, vs)
    },
  },
}
</script>
