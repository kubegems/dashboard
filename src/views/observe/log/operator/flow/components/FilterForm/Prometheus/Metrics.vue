<template>
  <Card>
    <v-btn
      slot="title"
      small
      color="primary"
      @click="onAddMetric"
    >
      metrics<v-icon right>mdi-plus</v-icon>
    </v-btn>

    <div
      v-for="(item, index) in cloneMetrics"
      :key="item._$key"
      class="d-flex"
    >
      <v-row>
        <v-col cols="4">
          <v-text-field
            v-model="cloneMetrics[index].name"
            label="name"
            :rules="formRules.name"
          />
        </v-col>
        <v-col cols="4">
          <v-select
            v-model="cloneMetrics[index].type"
            :items="typeItems"
            label="type"
            :rules="formRules.type"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
              >
                {{ item }}
              </v-chip>
            </template>
          </v-select>
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model="cloneMetrics[index].desc"
            label="desc"
            :rules="formRules.desc"
          />
        </v-col>
      </v-row>

      <v-btn
        color="error"
        small
        class="ml-4 mt-6"
        text
        @click="onRemoveMetric(index)"
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
  name: 'PrometheusMetrics',
  components: {
    Card,
  },
  props: {
    metrics: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    this.formRules = {
      name: [required],
      type: [required],
      desc: [required],
    }

    this.typeItems = ['counter', 'gauge', 'summary', 'histogram']

    return {
      cloneMetrics: [],
    }
  },
  watch: {
    metrics: {
      handler(newValue) {
        this.cloneMetrics = newValue.map((m) => ({ ...m }))
      },
      immediate: true,
    },
  },
  methods: {
    onAddMetric() {
      this.cloneMetrics.push({
        _$key: Date.now(),
        name: undefined,
        type: undefined,
        desc: undefined,
      })
    },
    onRemoveMetric(index) {
      this.cloneMetrics.splice(index, 1)
    },
    // eslint-disable-next-line vue/no-unused-properties
    getValue() {
      return this.cloneMetrics
    },
  },
}
</script>
