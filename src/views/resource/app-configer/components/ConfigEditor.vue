<template>
  <div class="text-center">
    <v-dialog
      v-model="show"
      persistent
      fullscreen
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-title> {{ isCreate ? "创建配置项" : "编辑配置项" }} </v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <v-btn
              text
              @click="close"
            >
              取消
            </v-btn>
            <v-spacer />
            <v-spacer />
            <v-btn
              text
              @click="submit"
            >
              {{ isCreate ? "创建" : "保存" }}
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-title class="text-h5 blue lighten-5">
          <v-row>
            <v-col>
              <v-text-field
                label="租户"
                :value="editItem.tenant"
                disabled
              />
            </v-col>
            <v-col>
              <v-text-field
                label="项目"
                :value="editItem.project"
                disabled
              />
            </v-col>
            <v-col>
              <v-text-field
                label="环境"
                :value="editItem.environment"
                disabled
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model="editItem.application"
                label="应用"
                :disabled="!isCreate"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model="editItem.key"
                label="key"
                :disabled="!isCreate"
              />
            </v-col>
          </v-row>
        </v-card-title>
        <ACEEditor
          v-model="editItem.value"
          class="rounded-0 mb-4"
          :lang="format"
          :height="1000"
          @init="$aceinit"
          @keydown.stop
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
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
      return {
        show: false,
        editItem: {
          tenant: "",
          project: "",
          environment: "",
          application: "",
          key: "",
          value: "",
        },
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
        this.show = val
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
      },
    },
    methods: {
      close () {
        this.$emit("close")
      },
      submit() {
        this.$emit("submit", this.editItem, this.isCreate)
      },
    },
  }
</script>

