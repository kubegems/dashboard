<template>
  <Card
    :no-title="!edit"
    title="Auth"
  >
    <v-btn
      v-if="!edit"
      text
      color="primary"
      block
      @click="onEdit"
    >
      <v-icon
        left
        small
      >
        mdi-plus
      </v-icon>
      配置Auth
    </v-btn>

    <div
      v-else
      class="d-flex"
    >
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="username.valueFrom.secretKeyRef.name"
            :items="secretItems"
            label="用户名-密钥"
            no-data-text="暂无可选数据"
            single-line
            :rules="formRules.username"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="username.valueFrom.secretKeyRef.key"
            :items="secretMap[username.valueFrom.secretKeyRef.name] || []"
            label="用户名-密钥键"
            attach
            no-data-text="暂无可选数据"
            :rules="formRules.username"
            :disabled="!username.valueFrom.secretKeyRef.name"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
              >
                {{ item }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="password.valueFrom.secretKeyRef.name"
            :items="secretItems"
            label="密码-密钥"
            no-data-text="暂无可选数据"
            single-line
            :rules="formRules.password"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="password.valueFrom.secretKeyRef.key"
            :items="secretMap[password.valueFrom.secretKeyRef.name] || []"
            attach
            label="密码-密钥键"
            no-data-text="暂无可选数据"
            :rules="formRules.password"
            :disabled="!password.valueFrom.secretKeyRef.name"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
              >
                {{ item }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>

      <v-btn
        color="error"
        small
        class="ml-4 mt-6"
        text
        @click="onRemove"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>
  </Card>
</template>

<script>
import { mapState } from 'vuex'
import { getSecretList } from '@/api'
import { required } from '@/utils/rules'
import Card from '@/views/observe/log/operator/components/Card'

export default {
  name: 'LokiAuth',
  components: {
    Card,
  },
  props: {
    loki: {
      type: Object,
      required: true,
    },
  },
  data() {
    this.formRules = {
      password: [required],
      username: [required],
    }

    return {
      edit: false,
      username: undefined,
      password: undefined,
      secretItems: [],
      secretMap: {},
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
  },
  watch: {
    loki: {
      handler() {
        this.edit = !!this.loki.username || !!this.loki.password
        this.setValue()
      },
      immediate: true,
    },
  },
  mounted () {
    this.getSecretList()
  },
  methods: {
    setValue() {
      this.username = this.loki.username || {
        valueFrom: { secretKeyRef: { name: undefined, key: undefined } },
      }
      this.password = this.loki.password || {
        valueFrom: { secretKeyRef: { name: undefined, key: undefined } },
      }
    },
    onEdit() {
      this.edit = true
      this.setValue()
    },
    async getSecretList() {
      const { cluster, namespace } = this.$route.query
      const data = await getSecretList(cluster, namespace, { size: 500 })
      this.secretItems = data.List.map((item) => {
        // 构造键选择器
        this.$set(
          this.secretMap,
          item.secret.metadata.name,
          Object.keys(item.secret.data || {}),
        )
        return {
          text: item.secret.metadata.name,
          value: item.secret.metadata.name,
        }
      })
    },
    onRemove() {
      this.edit = false
      this.username = undefined
      this.password = undefined
    },
    // eslint-disable-next-line vue/no-unused-properties
    getValue() {
      return {
        username: this.username,
        password: this.password,
      }
    },
  },
}
</script>
