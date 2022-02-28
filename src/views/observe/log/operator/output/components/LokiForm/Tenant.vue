<template>
  <Card
    :no-title="!edit"
    title="Tenant"
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
      配置Tenant
    </v-btn>

    <div
      v-else
      class="d-flex"
    >
      <v-text-field
        v-model="tenant"
        label="tenant"
        :rules="formRules.tenant"
      />

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
  name: 'LokiTenant',
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
      tenant: [required],
    }

    return {
      edit: false,
      tenant: undefined,
    }
  },
  watch: {
    loki: {
      handler() {
        this.tenant = this.loki.tenant
        this.edit = !!this.loki.tenant
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
      this.tenant = undefined
    },
    // eslint-disable-next-line vue/no-unused-properties
    getValue() {
      return this.tenant
    },
  },
}
</script>
