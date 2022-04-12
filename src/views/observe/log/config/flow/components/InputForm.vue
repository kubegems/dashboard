<template>
  <v-sheet>
    <v-row v-if="match.length">
      <v-col
        v-for="(item, index) in match"
        :key="item._$key"
        cols="6"
      >
        <Card title="Match">
          <Card title="Select">
            <Lables
              :ref="`labels${index}`"
              :labels="item.select.labels"
            />
            <ContainerNames
              :ref="`containerNames${index}`"
              :tags="item.select.container_names"
              label="container_name"
              title="container_names"
            />
          </Card>
          <div class="text-right">
            <v-btn
              color="error"
              small
              text
              @click="onRemoveMatch(index)"
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
        color="primary"
        block
        @click="onAddMatch"
      >
        <v-icon left>mdi-plus</v-icon>
        配置Match
      </v-btn>
    </Card>
  </v-sheet>
</template>

<script>
import Card from '@/views/observe/log/operator/components/Card'
import Lables from '@/views/observe/log/operator/components/LabelsInput'
import ContainerNames from '@/views/observe/log/operator/components/TagsInput'
import { required } from '@/utils/rules'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'FlowInputForm',
  components: {
    Card,
    Lables,
    ContainerNames,
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

    return {
      match: [],
    }
  },
  watch: {
    data: {
      handler(newValue) {
        const match = newValue.spec?.match || []
        this.match = match.map((m, index) => ({
          ...m,
          _$key: index,
          select: m.select || {},
        }))
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    this.onUpdateData()
  },
  methods: {
    onAddMatch() {
      this.match.push({
        select: {},
      })
    },
    onRemoveMatch(index) {
      this.match.splice(index, 1)
    },
    onUpdateData() {
      const data = deepCopy(this.data)
      if (!data.spec) {
        data.spec = {}
      }
      data.spec.match = this.match
        .map((m, index) => {
          const newMatch = { ...m }
          delete newMatch._$key
          const labels = this.$refs[`labels${index}`][0].getValue()
          const names = this.$refs[`containerNames${index}`][0].getValue()
          if (labels) newMatch.select.labels = labels
          if (names) newMatch.select.container_names = names
          if (Object.keys(newMatch.select).length === 0) delete newMatch.select
          return newMatch
        })
        .filter((m) => Object.keys(m).length > 0)
      if (data.spec.match.length === 0) {
        delete data.spec.match
      }
      this.$emit('update:data', data)
    },
  },
}
</script>
