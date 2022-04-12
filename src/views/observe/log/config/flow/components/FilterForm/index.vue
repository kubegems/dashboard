<template>
  <v-sheet>
    <v-row v-if="filters.length">
      <v-col
        v-for="(item, index) in filters"
        :key="item._$key"
        cols="6"
      >
        <Card title="Filter">
          <v-select
            v-model="filters[index]._$type"
            label="plugin"
            attach
            :items="filterItems"
            @change="onPluginChange($event, index)"
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
          <component
            :is="filterComponentMap[filters[index]._$type]"
            v-if="filters[index]._$type"
            :ref="`pluginComponent${index}`"
            :data="item[filters[index]._$type]"
          />

          <div class="text-right">
            <v-btn
              color="error"
              small
              text
              @click="onRemoveFilter(index)"
            >
              移除此项
            </v-btn>
          </div>
        </Card>
      </v-col>
    </v-row>

    <Card
      no-title
      class="mt-4"
    >
      <v-btn
        text
        block
        color="primary"
        @click="onAddFilter"
      >
        <v-icon left>mdi-plus</v-icon>
        添加Filter
      </v-btn>
    </Card>
  </v-sheet>
</template>

<script>
import Card from '@/views/observe/log/operator/components/Card'
import DetectExceptions from './DetectExceptions'
import Parser from './Parser'
import Prometheus from './Prometheus'
import RecordModifier from './RecordModifier'
import Throttle from './Throttle'
import { required } from '@/utils/rules'

import { cloneDeep } from 'lodash'

export default {
  name: 'FlowFilterForm',
  components: {
    Card,
    DetectExceptions,
    Parser,
    Prometheus,
    RecordModifier,
    Throttle,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    this.formRules = {
      required: [required],
    }

    this.filterItems = [
      'detectExceptions',
      'parser',
      'prometheus',
      'record_modifier',
      'throttle',
    ]

    this.filterComponentMap = {
      detectExceptions: DetectExceptions,
      parser: Parser,
      prometheus: Prometheus,
      record_modifier: RecordModifier,
      throttle: Throttle,
    }

    return {
      filters: [],
    }
  },
  watch: {
    data: {
      handler(newValue) {
        const filters = newValue.spec?.filters || []
        this.filters = filters.map((f, index) => {
          const type = Object.keys(f)[0]
          return {
            _$key: index,
            _$type: type,
            ...f,
          }
        })
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    this.onUpdateData()
  },
  methods: {
    onPluginChange(value, index) {
      this.$set(this.filters, index, {
        _$key: this.filters[index]._$key,
        _$type: value,
      })
    },
    onAddFilter() {
      this.filters.push({
        _$key: Date.now(),
        _$type: undefined,
      })
    },
    onRemoveFilter(index) {
      this.filters.splice(index, 1)
    },
    onUpdateData() {
      const data = cloneDeep(this.data)
      data.spec.filters = this.filters.map((f, index) =>
        this.$refs[`pluginComponent${index}`][0].getValue(),
      )
      this.$emit('update:data', data)
    },
  },
}
</script>
