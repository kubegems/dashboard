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
          <v-text-field
            v-model="username"
            label="username"
            :rules="formRules.username"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="password"
            label="password"
            :rules="formRules.password"
          />
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
import Card from '@/views/observe/log/operator/components/Card'
import { required } from '@/utils/rules'

export default {
  name: 'ElasticsearchTenant',
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
      username: [required],
      password: [required],
    }

    return {
      edit: false,
      username: undefined,
      password: undefined,
    }
  },
  watch: {
    loki: {
      handler() {
        this.username = this.loki.username
        this.password = this.loki.password
        this.edit = !!this.username
      },
      immediate: true,
    },
  },
  methods: {
    onEdit() {
      this.edit = true
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
