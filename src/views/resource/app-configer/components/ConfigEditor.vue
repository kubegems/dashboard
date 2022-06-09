<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建应用"
    icon="mdi-wrench"
    @reset="reset"
  >
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        @click="submit"
      >
        确定
      </v-btn>
    </template>
    <template #header-action>
      <div class="white--text header ml-3">
        租户:{{ editItem.tenant }}
        项目:{{ editItem.project }}
        环境:{{ editItem.environment }}
      </div>
    </template>
    <template #content>
      <v-card>
        <v-card-text class="text-h5 card__title">
          <v-form
            ref="form"
            v-model="valid"
            class="pa-0"
            lazy-validation
            @submit.prevent
          >
            <v-row>
              <v-col col="5">
                <v-text-field
                  v-model="editItem.application"
                  label="应用"
                  :readonly="!isCreate"
                  :rules="applicationRules"
                />
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="editItem.key"
                  label="key"
                  :readonly="!isCreate"
                  :rules="keyRules"
                  @keyup="onKeyInput"
                />
              </v-col>
              <v-col cols="2">
                <v-autocomplete
                  v-model="suffix"
                  :items="suffixItems"
                  label="类型"
                  :readonly="!isCreate"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <ACEEditor
          v-model="editItem.value"
          class="rounded-b mb-4"
          :lang="format"
          :height="600"
          @init="$aceinit"
          @keydown.stop
        />
      </v-card>
    </template>
  </BaseDialog>
</template>

<script>
import { required } from '@/utils/rules'

export default {
  name: 'ConfigeEditor',
  props: {
    item: {
      type: Object,
      default: () => {
        return {
          tenant: "",
          project: "",
          environment: "",
          application: "",
          key: "",
          value: "",
        }
      },
    },
    showEditDialog: {
      type: Boolean,
      default: false,
    },
    isCreate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    this.applicationRules = [required]
    this.keyRules = [required]

    return {
      dialog: false,
      valid: false,
      editItem: {
        tenant: "",
        project: "",
        environment: "",
        application: "",
        key: "",
        value: "",
      },
      suffix: '',
      suffixItems: [
        {text: 'json', value: 'json'},
        {text: 'xml', value: 'xml'},
        {text: 'yaml', value: 'yaml'},
        {text: 'html', value: 'html'},
        {text: 'ini', value: 'ini'},
      ],
    }
  },
  computed: {
    format() {
      const seps = this.editItem.key.split(".")
      if (seps.length === 1) {
        return "text"
      } else {
        const f = seps[seps.length - 1]
        if (["json", "xml", "yaml", "html", "properties", "ini"].includes(f.toLowerCase())) {
          return f
        } else {
          return "text"
        }
      }
    },
  },
  watch: {
    showEditDialog(val) {
      this.dialog = val
    },
    item() {
      this.editItem = {
        tenant: this.item.tenant,
        project: this.item.project,
        environment: this.item.environment,
        application: this.item.application,
        key: this.item.key,
        value: this.item.value,
      }
      this.matchSuffix()
    },
  },
  methods: {
    close () {
      this.$emit("close")
    },
    submit() {
      if (this.$refs.form.validate(true)) {
        if (this.suffix && this.editItem.key.indexOf('.') === -1) {
          this.editItem.key = `${this.editItem.key}.${this.suffix}`
        }
        this.$emit("submit", this.editItem, this.isCreate)
        this.reset()
      }
    },
    reset() {
      this.close()
      this.$refs.form.reset()
    },
    matchSuffix() {
      if (this.editItem.key.indexOf('.') > -1) {
        const suffix = this.editItem.key.split('.').pop().toLowerCase()
        if (this.suffixItems.some(s => { return s.value === suffix })) {
          this.suffix = suffix
        }
      }
    },
    onKeyInput() {
      this.matchSuffix()
    },
  },
}
</script>

<style lang="scss" scoped>
.card {
  &__title {
    background-color: #f6f6f6;
  }
}
.header {
  line-height: 40px;
}
</style>
