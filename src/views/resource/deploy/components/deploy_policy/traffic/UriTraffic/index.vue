<template>
  <v-form
    v-model="valid"
    lazy-validation
  >
    <v-card-text class="px-0">
      <v-row class="px-2">
        <v-col cols="6">
          <v-autocomplete
            v-model="traffic"
            color="primary"
            :items="trafficItems"
            label="流量比例"
            hide-selected
            class="my-0"
            no-data-text="暂无可选数据"
            @change="onTrafficChange"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
                class="mx-1"
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col
          v-if="traffic === 'true'"
          cols="6"
        >
          <v-text-field
            v-model="obj.strategy.canary.steps[0].setWeight"
            :rules="canaryRules.setWeightRule"
            class="my-0"
            required
            label="灰度流量比例"
            suffix="%"
            type="number"
            @keyup="onWeightInput"
          />
        </v-col>
        <v-col cols="6">
          <v-switch
            v-model="
              obj.strategy.canary.trafficRouting.istio.virtualService
                .ignoreUriCase
            "
            class="mt-4"
            label="ignoreUriCase"
            @change="onIgnoreUriCaseChange"
          />
        </v-col>
      </v-row>
      <BaseSubTitle title="匹配(uri)" />
      <UriMatchForm
        :data="obj.strategy.canary.trafficRouting.istio.virtualService.uri"
        @addData="addUriData"
      />
    </v-card-text>
  </v-form>
</template>

<script>
import UriMatchForm from './UriMatchForm'
import { deepCopy } from '@/utils/helpers'
import { required, positiveInteger } from '@/utils/rules'

export default {
  name: 'UriTraffic',
  components: {
    UriMatchForm,
  },
  data() {
    return {
      valid: false,
      canaryRules: {
        setWeightRule: [
          positiveInteger,
        ],
        uriRule: [required],
      },
      traffic: 'false',
      trafficItems: [
        { text: '默认流量比例', value: 'false' },
        { text: '自定义流量比例', value: 'true' },
      ],
      obj: {
        strategy: {
          canary: {
            steps: [
              {
                setWeight: 10,
              },
            ],
            trafficRouting: {
              istio: {
                virtualService: {
                  uri: null,
                  ignoreUriCase: true,
                },
              },
            },
          },
        },
      },
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.onTrafficChange()
    })
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.obj = deepCopy(data)
    },
    onWeightInput() {
      this.$emit('updateComponentData', this.obj)
    },
    onTrafficChange() {
      if (this.traffic === 'false') {
        this.obj.strategy.canary.steps[0].setWeight = 10
        this.$emit('updateComponentData', this.obj)
      }
    },
    addUriData(data) {
      this.obj.strategy.canary.trafficRouting.istio.virtualService.uri = data
      this.$emit('updateComponentData', this.obj)
    },
    onIgnoreUriCaseChange() {
      this.$emit('updateComponentData', this.obj)
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.obj = deepCopy(this.$options.data().obj)
    },
  },
}
</script>
