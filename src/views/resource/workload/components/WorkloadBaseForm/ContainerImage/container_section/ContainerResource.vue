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
                <span>CPU</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.requests.cpu"
                  required
                  label="Reuqests"
                  :rules="objRules.requestsCpuRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.limits.cpu"
                  required
                  label="Limits"
                  :rules="objRules.limitsCpuRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width"
              >
                <span>内存</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.requests.memory"
                  required
                  label="Requests"
                  :rules="objRules.requestsMemoryRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.limits.memory"
                  required
                  label="Limits"
                  :rules="objRules.limitsMemoryRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
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
    <v-sheet class="grey lighten-4 rounded-0 ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__form-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    containerCopy &&
                      containerCopy.resources &&
                      containerCopy.resources.requests
                      ? containerCopy.resources.requests.cpu==='0'?'无限制':containerCopy.resources.requests.cpu
                      : '无限制'
                  }}
                  ～
                  {{
                    containerCopy &&
                      containerCopy.resources &&
                      containerCopy.resources.limits
                      ? containerCopy.resources.limits.cpu==='0'?'无限制':containerCopy.resources.limits.cpu
                      : '无限制'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  CPU
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__form-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    containerCopy &&
                      containerCopy.resources &&
                      containerCopy.resources.requests
                      ? containerCopy.resources.requests.memory==='0'?'无限制':containerCopy.resources.requests.memory
                      : '无限制'
                  }}
                  ～
                  {{
                    containerCopy &&
                      containerCopy.resources &&
                      containerCopy.resources.limits
                      ? containerCopy.resources.limits.memory==='0'?'无限制':containerCopy.resources.limits.memory
                      : '无限制'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  内存
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
          @click="updateData"
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
          @click="removeData"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
  </v-form>
</template>

<script>
import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers'

export default {
  name: 'ContainerResource',
  props: {
    container: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      obj: {
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
        limits: {
          cpu: 2,
          memory: '4Gi',
        },
      },
      containerCopy: null,
    }
  },
  computed: {
    objRules() {
      return {
        requestsCpuRule: [
          (v) =>
            (!!new RegExp('^\\d+[m]?$').test(v) && parseInt(v) >= 0) ||
            '格式错误(示例:1m,1)',
        ],
        requestsMemoryRule: [
          (v) =>
            (!!new RegExp('(^\\d+[M|G]i$)').test(v) && parseInt(v) >= 0) ||
            '格式错误(示例:1Mi,1Gi)',
        ],
        limitsCpuRule: [
          (v) =>
            (!!new RegExp('^\\d+[m]?$').test(v) && parseInt(v) >= 0) ||
            '格式错误(示例:1m,1)',
          (v) =>
            sizeOfCpu(v) >= sizeOfCpu(this.obj.requests.cpu) ||
            'Limits小于Requests',
        ],
        limitsMemoryRule: [
          (v) =>
            (!!new RegExp('(^\\d+[M|G]i$)').test(v) && parseInt(v) >= 0) ||
            '格式错误(示例:1Mi,1Gi)',
          (v) =>
            sizeOfStorage(v) >= sizeOfStorage(this.obj.requests.memory) ||
            'Limits小于Requests',
        ],
      }
    },
  },
  watch: {
    container() {
      if (this.container) this.containerCopy = deepCopy(this.container)
      else this.containerCopy = {}
    },
  },
  mounted() {
    if (this.container) this.containerCopy = deepCopy(this.container)
    else this.containerCopy = {}
  },
  methods: {
    expandCard() {
      this.expand = true
    },
    closeCard() {
      this.expand = false
      this.obj = {
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
        limits: {
          cpu: 2,
          memory: '4Gi',
        },
      }
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        this.$set(this.containerCopy, 'resources', this.obj)
        this.$emit('updateComponentData', this.containerCopy)
        this.closeCard()
      }
    },
    removeData() {
      this.$set(this.containerCopy, 'resources', null)
      this.$emit('updateComponentData', this.containerCopy)
    },
    updateData() {
      if (
        this.containerCopy &&
        this.containerCopy.resources &&
        this.containerCopy.resources.requests
      ) {
        this.obj.requests = deepCopy(this.containerCopy.resources.requests)
      }
      if (
        this.containerCopy &&
        this.containerCopy.resources &&
        this.containerCopy.resources.limits
      ) {
        this.obj.limits = deepCopy(this.containerCopy.resources.limits)
      }
      this.expandCard()
    },
  },
}
</script>
