<template>
  <v-dialog v-model="Confirm.value" max-width="500" persistent scrollable>
    <v-card class="pa-0">
      <v-sheet class="px-4 py-2 error--text text-h6">
        {{ Confirm.title }}
      </v-sheet>
      <v-divider />
      <v-sheet
        v-if="
          Confirm.content &&
          (Confirm.content.type === 'delete' ||
            Confirm.content.type === 'batch_delete')
        "
        class="px-4 py-4 confirm-size"
      >
        <v-alert
          border="left"
          colored-border
          :color="(Confirm.content && Confirm.content.level) || 'warning'"
          elevation="1"
          class="rounded py-3"
        >
          <template
            v-if="Confirm.content && Confirm.content.type === 'batch_delete'"
          >
            <div class="text-subtitle-1 kubegems__detail">
              请确认以下需要删除的资源！
            </div>
            <div
              v-for="(content, index) in Confirm.content
                ? Confirm.content.text.split(',')
                : []"
              :key="index"
              class="text-subtitle-1 kubegems__detail kubegems__break-all"
            >
              {{ content }}
              <template
                v-if="
                  Object.prototype.hasOwnProperty.call(
                    Confirm.content.status,
                    content,
                  )
                "
              >
                <v-icon
                  v-if="Confirm.content.status[content]"
                  small
                  right
                  color="success"
                  >mdi-check</v-icon
                >
                <v-icon v-else small right color="error">mdi-close</v-icon>
              </template>
            </div>
          </template>
          <template v-if="Confirm.content && Confirm.content.type === 'delete'">
            <div
              v-for="(content, index) in Confirm.content
                ? Confirm.content.text.split(',')
                : []"
              :key="index"
              class="text-subtitle-1 kubegems__detail kubegems__break-all"
              v-html="content"
            ></div>
          </template>
        </v-alert>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-text-field
            v-if="Confirm.content.type === 'delete'"
            v-model="confirmData"
            class="my-0"
            :rules="confirmDataRule"
            required
            label="确认资源名称"
            @keydown.enter="confirm"
          >
          </v-text-field>
          <v-text-field
            v-else-if="Confirm.content.type === 'batch_delete'"
            v-model="confirmData"
            class="my-0"
            :rules="confirmBacthDataRule"
            required
            :label="`${Confirm.content.one?'确认资源名称':'请输入 “确认删除”'}`"
            @keydown.enter="confirm"
          >
          </v-text-field>
        </v-form>
      </v-sheet>
      <v-sheet v-else-if="Confirm.content" class="px-4 py-4 confirm-size">
        <v-flex
          class="text-subtitle-1 kubegems__detail kubegems__break-all"
          v-html="Confirm.content.text"
        >
        </v-flex>
      </v-sheet>
      <div class="pb-3 pr-4">
        <v-btn
          class="float-right"
          color="primary"
          small
          text
          :loading="Circular"
          @click="confirm"
        >
          确定
        </v-btn>
        <v-btn
          class="float-right"
          color="error"
          small
          text
          @click="closeConfirmDialog"
        >
          取消
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { required } from '@/utils/rules'

export default {
  name: 'BaseConfirm',
  data() {
    return {
      valid: false,
      confirmData: '',
    }
  },
  computed: {
    ...mapState(['Confirm', 'Circular']),
    confirmDataRule() {
      return [
        required,
        (v) => !!(v === this.Confirm.content.name) || '名称不匹配',
      ]
    },
    confirmBacthDataRule() {
      if (this.Confirm.content.one) {
        return [
          required,
          (v) => !!(v === this.Confirm.content.one) || '名称不匹配',
        ]
      }else{
        return [
          required,
          (v) => !!(v === '确认删除') || '输入不匹配',
        ]
      }
    },
  },
  methods: {
    async closeConfirmDialog() {
      await this.Confirm.doClose(this.Confirm.param)
      this.Confirm.value = false
      this.confirmData = ''
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },
    async confirm() {
      if (
        (['delete', 'batch_delete'].indexOf(this.Confirm.content.type) > -1 &&
          this.$refs.form.validate(true)) ||
        ['delete', 'batch_delete'].indexOf(this.Confirm.content.type) === -1
      ) {
        await this.Confirm.doFunc(this.Confirm.param)
        if (
          !this.Confirm.content.status ||
          Object.values(this.Confirm.content.status).indexOf(false) === -1
        ) {
          this.Confirm.value = false
        }
        this.confirmData = ''
        if (this.$refs.form) {
          this.$refs.form.resetValidation()
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.confirm-size {
  max-height: 400px;
  overflow-y: auto;
}
</style>
