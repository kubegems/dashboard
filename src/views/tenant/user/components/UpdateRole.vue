<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="用户系统角色"
    icon="mdi-account-edit"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle title="用户角色" />
      <v-card-text class="pa-2 mt-2">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-sheet>
            <v-text-field
              v-model="obj.Username"
              class="my-0"
              :rules="objRules.userIDRules"
              required
              readonly
              label="用户"
            />
            <v-autocomplete
              v-model="obj.SystemRoleID"
              class="my-0"
              :items="systemRoleSelect"
              :rules="objRules.systemRoleRules"
              color="primary"
              hide-selected
              label="角色"
              no-data-text="暂无可选数据"
              @focus="onSystemRoleSelectFocus"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  class="mx-1"
                  small
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
        @click="changeUserRole"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { putChangeUserRole } from '@/api'
import BaseSelect from '@/mixins/select'
import { required } from '@/utils/rules'

export default {
  name: 'UpdateRole',
  mixins: [BaseSelect],
  data: () => ({
    dialog: false,
    valid: false,
    obj: {
      UserID: 0,
      Username: '',
      SystemRoleID: 0,
    },
    objRules: {
      userIDRules: [required],
      systemRoleRules: [required],
    },
  }),
  computed: {
    ...mapState(['Circular']),
  },
  mounted() {
    this.systemRoleSelectData()
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async changeUserRole() {
      if (this.$refs.form.validate(true)) {
        await putChangeUserRole(this.obj.SystemRoleID, this.obj.UserID, this.obj)
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(item) {
      this.obj = {
        Username: item.Username,
        UserID: item.ID,
        SystemRoleID: item.SystemRoleID,
      }
    },
    reset() {
      this.dialog = false
      this.$refs.form.reset()
    },
    onSystemRoleSelectFocus() {
      this.systemRoleSelectData()
    },
  },
}
</script>
