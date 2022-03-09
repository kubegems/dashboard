<template>
  <v-form
    v-model="valid"
    lazy-validation
    class="my-2"
  >
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width"
              >
                <span>匹配策略</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-combobox
                  v-model="destinationSubnets"
                  hide-no-data
                  :items="[]"
                  :search-input.sync="destinationSubnetsText"
                  multiple
                  small-chips
                  label="destinationSubnets(回车)"
                  height="32"
                  @change="onDestinationSubnetsChange"
                  @keydown.enter="createDestinationSubnets"
                >
                  <template #selection="{ item }">
                    <v-chip
                      small
                      color="primary"
                      class="pa-1"
                    >
                      <span>
                        {{ item.text }}
                      </span>
                      <v-icon
                        small
                        @click="removeDestinationSubnets(item)"
                      >
                        mdi-close
                      </v-icon>
                    </v-chip>
                  </template>
                </v-combobox>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.port"
                  class="my-0"
                  required
                  label="port"
                  type="number"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.sourceNamespace"
                  class="my-0"
                  required
                  label="sourceNamespace"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="obj.gateways"
                  color="primary"
                  :items="[]"
                  label="网关"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
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
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <LabelForm
              ref="labelForm"
              :data="obj.sourceLabels"
              @addData="addLabelData"
            />
            <BaseSubTitle title="标签(sourceLabels)" />
            <v-card-text class="pa-2">
              <LabelItem
                :labels="obj.sourceLabels"
                @updateLabels="updateLabels"
                @removeLabels="removeLabels"
                @expandCard="expandLabelCard"
              />
              <div class="kubegems__clear-float" />
            </v-card-text>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn
            text
            small
            color="error"
            @click="closeCard"
          >
            取消
          </v-btn>
          <v-btn
            text
            small
            color="primary"
            @click="addData"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
    <v-sheet
      v-for="(match, index) in matchCopy"
      :key="index"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ match.destinationSubnets }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  destinationSubnets
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ match.sourceNamespace }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  sourceNamespace
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="primary"
          @click="updateData(index)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="error"
          @click="removeData(index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded-0 ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn
              text
              color="primary"
              @click="expandCard"
            >
              <v-icon
                left
                small
              >
                mdi-plus
              </v-icon>
              添加匹配策略
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
import LabelItem from '@/views/resource/components/label/LabelItem'
import LabelForm from '@/views/resource/components/label/LabelForm'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'L4MatchAttributesForm',
  components: {
    LabelItem,
    LabelForm,
  },
  props: {
    match: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      obj: {
        index: -1,
        port: null,
        sourceNamespace: '',
        gateways: [],
        sourceLabels: {},
        destinationSubnets: [],
      },
      matchCopy: [],
      destinationSubnets: [],
      destinationSubnetsText: '',
    }
  },
  watch: {
    match() {
      if (this.matchCopy) {
        this.matchCopy = deepCopy(this.match)
      }
    },
  },
  mounted() {
    if (this.matchCopy) {
      this.matchCopy = deepCopy(this.match)
    }
  },
  methods: {
    onDestinationSubnetsChange() {
      const destinationSubnets = this.destinationSubnets.filter((d) => {
        return d !== '' && typeof d === 'object'
      })
      this.destinationSubnets = destinationSubnets
    },
    createDestinationSubnets() {
      if (!this.destinationSubnetsText) return
      const index = this.destinationSubnets.length
      this.destinationSubnets.push({
        text: this.destinationSubnetsText,
        value: index,
      })
      this.destinationSubnetsText = ''
    },
    removeDestinationSubnets(item) {
      const destinationSubnets = this.destinationSubnets.filter((d) => {
        return d.value !== item.value
      })
      this.destinationSubnets = destinationSubnets
    },

    expandCard() {
      this.expand = true
    },
    closeCard() {
      this.expand = false
      this.obj = deepCopy(this.$options.data().obj)
      this.$refs.form.resetValidation()
      this.destinationSubnets = []
      this.destinationSubnetsText = ''
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        const data = deepCopy(this.obj)
        data.destinationSubnets = this.destinationSubnets.map((d) => {
          return d.text
        })
        delete data['index']
        if (this.obj.index === -1) {
          this.matchCopy.push(data)
        } else {
          this.$set(this.matchCopy, this.obj.index, data)
        }
        this.$emit('updateComponentData', this.matchCopy)
        this.closeCard()
      }
    },
    removeData(index) {
      this.$delete(this.matchCopy, index)
      this.$emit('updateComponentData', this.matchCopy)
    },
    updateData(index) {
      this.obj = deepCopy(this.matchCopy[index])
      this.obj = { ...this.obj, index: index }
      this.obj.destinationSubnets.forEach((d, index) => {
        this.destinationSubnets.push({
          text: d,
          value: index,
        })
      })
      this.expandCard()
    },
    expandLabelCard() {
      this.$nextTick(() => {
        this.$refs.labelForm.expandCard()
        this.expand = true
      })
    },
    addLabelData(data) {
      this.obj.sourceLabels = data
    },
    removeLabels(key) {
      this.$delete(this.obj.sourceLabels, key)
    },
    updateLabels(key) {
      const data = { key: key, value: this.obj.sourceLabels[key] }
      this.$nextTick(() => {
        this.$refs.labelForm.init(data)
        this.expand = true
      })
    },
  },
}
</script>
