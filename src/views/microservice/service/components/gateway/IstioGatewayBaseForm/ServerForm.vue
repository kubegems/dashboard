<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    class="my-2"
    @submit.prevent
  >
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex
              class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width pt-5"
            >
              <span>端口定义</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="server.port.number"
                class="my-0"
                required
                type="number"
                label="端口"
                :rules="serverRules.numberRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="server.port.protocol"
                class="my-0"
                required
                label="协议"
                :rules="serverRules.protocolRule"
                @keyup="onProtocolInput"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="pt-2 px-2">
            <v-flex
              class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width pt-4"
            >
              <span />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="server.bind"
                class="my-0"
                required
                label="bind"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet class="pt-2 px-2">
            <v-flex
              class="float-left text-subtitle-2 primary--text kubegems__min-width pt-6"
            >
              <span>hosts定义</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__long-width">
              <v-combobox
                v-model="hosts"
                hide-no-data
                :items="[]"
                :search-input.sync="hostText"
                multiple
                small-chips
                label="hosts(回车)"
                height="32"
                @change="onHostChange"
                @keydown.enter="createHost"
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
                      @click="removeHost(item)"
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
              class="float-left text-subtitle-2 primary--text kubegems__min-width pt-5"
            >
              <span>tls定义</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-switch
                v-model="tls"
                hide-details
                class="mt-5"
                label="开启tls"
                @change="onTLSChange"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>

          <v-sheet
            v-if="tls"
            class="pt-2 px-2"
          >
            <v-flex
              class="float-left text-subtitle-2 primary--text kubegems__min-width pt-5"
            >
              <span />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="server.tls.mode"
                color="primary"
                :items="tlsModeItems"
                label="mode"
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

            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="server.tls.credentialName"
                color="primary"
                :items="secretItems"
                label="credentialName"
                hide-selected
                class="my-0"
                no-data-text="暂无可选数据"
                :rules="serverRules.credentialNameRule"
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
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import { getSecretList } from '@/api'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'ServerForm',
  props: {
    data: {
      type: Array,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      tls: false,
      tlsModeItems: [{ text: 'SIMPLE', value: 'SIMPLE' }],
      secretItems: [],
      serversCopy: {},
      hosts: [],
      server: {
        index: -1,
        port: {
          number: 0,
          name: '',
          protocol: '',
        },
        hosts: [],
        bind: '',
      },
      serverRules: {
        numberRule: [required],
        protocolRule: [
          required,
          (v) =>
            !!new RegExp(
              '^HTTP$|^HTTPS$|^TCP$|^MONGO$|^GRPC$|^TLS$|^HTTP2$',
              'g',
            ).test(v) || '不支持该协议',
        ],
        nameRule: [required],
        credentialNameRule: [required],
      },
      hostText: '',
    }
  },
  computed: {
    ...mapState(['EnvironmentFilter']),
  },
  watch: {
    data() {
      this.serversCopy = deepCopy(this.data)
    },
  },
  mounted() {
    if (this.data) {
      this.serversCopy = deepCopy(this.data)
      this.secretList()
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.server = deepCopy(data)
      this.hosts = this.server.hosts.map((h, index) => {
        return { text: h, value: index }
      })
      if (this.server.tls) {
        this.tls = true
      } else {
        this.tls = false
      }
      this.secretList()
      this.expand = true
    },
    async secretList() {
      const data = await getSecretList(
        this.EnvironmentFilter.cluster,
        'gemcloud-gateway-system',
        {
          size: 1000,
          noprocessing: true,
        },
      )
      this.secretItems = data.List.filter((s) => {
        return s.secret.type === 'kubernetes.io/tls'
      })
      this.secretItems.forEach((v) => {
        v.text = v.secret.metadata.name
        v.value = v.secret.metadata.name
      })
    },
    onHostChange() {
      const hosts = this.hosts.filter((host) => {
        return host !== '' && typeof host === 'object'
      })
      this.hosts = hosts
    },
    createHost() {
      if (!this.hostText) return
      const index = this.hosts.length
      this.hosts.push({
        text: this.hostText,
        value: index,
      })
      this.hostText = ''
    },
    removeHost(item) {
      const hosts = this.hosts.filter((host) => {
        return host.value !== item.value
      })
      this.hosts = hosts
    },
    onProtocolInput() {
      this.server.port.name = `${this.server.port.protocol}-${this.server.port.number}`
    },
    onTLSChange() {
      if (this.tls) {
        this.server.tls = {
          mode: 'SIMPLE',
          credentialName: '',
        }
      } else {
        this.$delete(this.server, 'tls')
      }
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        const data = deepCopy(this.server)
        data.hosts = this.hosts.map((d) => {
          return d.text
        })
        delete data['index']
        if (this.server.index === -1) {
          this.serversCopy.push(data)
        } else {
          this.$set(this.serversCopy, this.server.index, data)
        }
        this.$emit('addData', this.serversCopy)
        this.closeCard()
      }
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.server.index = -1
      this.$emit('closeOverlay')
    },
    // eslint-disable-next-line vue/no-unused-properties
    expandCard() {
      this.expand = true
    },
  },
}
</script>
