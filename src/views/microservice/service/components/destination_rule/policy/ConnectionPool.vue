<template>
  <v-form
    v-model="valid"
    lazy-validation
    class="my-2"
    @submit.prevent
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
            @submit.prevent
          >
            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>TCP</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcp.maxConnections"
                  class="my-0"
                  required
                  label="maxConnections"
                  :rules="objRules.maxConnectionsRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcp.connectTimeout"
                  class="my-0"
                  required
                  label="connectTimeout"
                  :rules="objRules.connectTimeoutRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcp.tcpKeepalive.probes"
                  class="my-0"
                  required
                  label="tcpKeepalive.probes"
                  :rules="objRules.probesRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcp.tcpKeepalive.time"
                  class="my-0"
                  required
                  label="tcpKeepalive.time"
                  :rules="objRules.timeRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcp.tcpKeepalive.interval"
                  class="my-0"
                  required
                  label="tcpKeepalive.interval"
                  :rules="objRules.intervalRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>HTTP</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.http.http1MaxPendingRequests"
                  class="my-0"
                  required
                  label="http1MaxPendingRequests"
                  :rules="objRules.http1MaxPendingRequestsRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.http.http2MaxRequests"
                  class="my-0"
                  required
                  label="http2MaxRequests"
                  :rules="objRules.http2MaxRequestsRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.http.maxRequestsPerConnection"
                  class="my-0"
                  required
                  label="maxRequestsPerConnection"
                  :rules="objRules.maxRequestsPerConnectionRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.http.maxRetries"
                  class="my-0"
                  required
                  label="maxRetries"
                  :rules="objRules.maxRetriesRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.http.idleTimeout"
                  class="my-0"
                  required
                  label="idleTimeout"
                  :rules="objRules.idleTimeoutRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="obj.http.h2UpgradePolicy"
                  color="primary"
                  :items="h2UpgradePolicyItems"
                  label="h2UpgradePolicy"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                  :rules="objRules.h2UpgradePolicyRule"
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
            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-switch
                  v-model="obj.http.useClientProtocol"
                  hide-details
                  class="mt-5"
                  label="useClientProtocol"
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
    <v-sheet
      v-if="
        trafficPolicyCopy.connectionPool &&
          JSON.stringify(trafficPolicyCopy.connectionPool) !== '{}'
      "
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
                  {{ trafficPolicyCopy.connectionPool.tcp.maxConnections }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  tcp maxConnections
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.connectionPool.tcp.connectTimeout }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  tcp connectTimeout
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    trafficPolicyCopy.connectionPool.http
                      .maxRequestsPerConnection
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  http maxRequestsPerConnection
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.connectionPool.http.maxRetries }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  http maxRetries
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.connectionPool.http.idleTimeout }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  http idleTimeout
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
    <v-flex
      v-else
      class="grey lighten-4 rounded-0 ma-2"
    >
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
              添加连接池
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
import { deepCopy } from '@/utils/helpers'
import { required, positiveInteger } from '@/utils/rules'

export default {
  name: 'ConnectionPool',
  props: {
    trafficPolicy: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      h2UpgradePolicyItems: [
        { text: 'DEFAULT', value: 'DEFAULT' },
        { text: 'DO_NOT_UPGRADE', value: 'DO_NOT_UPGRADE' },
        { text: 'UPGRADE', value: 'UPGRADE' },
      ],
      obj: {
        tcp: {
          maxConnections: null,
          connectTimeout: '10s',
          tcpKeepalive: {
            probes: 9,
            time: '7200s',
            interval: '75s',
          },
        },
        http: {
          http1MaxPendingRequests: null,
          http2MaxRequests: null,
          maxRequestsPerConnection: null,
          maxRetries: null,
          idleTimeout: '3600s',
          h2UpgradePolicy: 'DEFAULT',
          useClientProtocol: false,
        },
      },
      objRules: {
        maxConnectionsRule: [
          positiveInteger,
        ],
        connectTimeoutRule: [
          (v) =>
            !!new RegExp('(^\\d+[s|m|h]$)').test(v) ||
            '格式错误(示例:30s,1m,1h)',
        ],
        probesRule: [positiveInteger],
        timeoutRule: [
          (v) =>
            !!new RegExp('(^\\d+[s|m|h]$)').test(v) ||
            '格式错误(示例:30s,1m,1h)',
        ],
        intervalRule: [
          (v) =>
            !!new RegExp('(^\\d+[s|m|h]$)').test(v) ||
            '格式错误(示例:30s,1m,1h)',
        ],
        http1MaxPendingRequestsRule: [
          positiveInteger,
        ],
        http2MaxRequestsRule: [
          positiveInteger,
        ],
        maxRequestsPerConnectionRule: [
          positiveInteger,
        ],
        maxRetriesRule: [
          positiveInteger,
        ],
        idleTimeoutRule: [
          (v) =>
            !!new RegExp('(^\\d+[s|m|h]$)').test(v) ||
            '格式错误(示例:30s,1m,1h)',
        ],
        h2UpgradePolicyRule: [required],
      },
      trafficPolicyCopy: {},
    }
  },
  watch: {
    trafficPolicy() {
      if (this.trafficPolicy) {
        this.trafficPolicyCopy = deepCopy(this.trafficPolicy)
      }
    },
  },
  mounted() {
    if (this.trafficPolicy) {
      this.trafficPolicyCopy = deepCopy(this.trafficPolicy)
    }
  },
  methods: {
    expandCard() {
      this.expand = true
    },
    closeCard() {
      this.expand = false
      this.obj = deepCopy(this.$options.data().obj)
      this.$refs.form.resetValidation()
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        if (!this.trafficPolicyCopy.connectionPool) {
          this.trafficPolicyCopy.connectionPool = {}
        }
        this.trafficPolicyCopy.connectionPool = this.obj
        this.$emit('updateComponentData', this.trafficPolicyCopy)
        this.closeCard()
      }
    },
    removeData() {
      this.$delete(this.trafficPolicyCopy, 'connectionPool')
      this.$emit('updateComponentData', this.trafficPolicyCopy)
    },
    updateData() {
      this.obj = deepCopy(this.trafficPolicyCopy.connectionPool)
      this.expandCard()
    },
  },
}
</script>
