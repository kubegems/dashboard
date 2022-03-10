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
          <BaseSubTitle title="匹配策略" />
          <TLSMatchAttributesForm
            :match="tls.match"
            @updateComponentData="updateMatchComponentData"
          />

          <BaseSubTitle title="路由策略" />
          <RouteDestinationForm
            :route="tls.route"
            @updateComponentData="updateRouteComponentData"
          />
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
import RouteDestinationForm from '@/views/microservice/service/components/virtual_service/route/RouteDestinationForm'
import TLSMatchAttributesForm from '@/views/microservice/service/components/virtual_service/match/TLSMatchAttributesForm'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'TLSForm',
  components: {
    RouteDestinationForm,
    TLSMatchAttributesForm,
  },
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
      tlsCopy: [],
      tls: {},
    }
  },
  watch: {
    data() {
      this.tlsCopy = deepCopy(this.data)
    },
  },
  mounted() {
    if (this.data) {
      this.tlsCopy = deepCopy(this.data)
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      if (data) {
        this.tls = deepCopy(data)
      } else {
        this.tls = {
          index: -1,
          match: [],
          route: [],
        }
      }
      this.expand = true
    },
    updateMatchComponentData(data) {
      this.tls.match = data
    },
    updateRouteComponentData(data) {
      this.tls.route = data
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        const data = deepCopy(this.tls)
        delete data['index']
        if (this.tls.index === -1) {
          this.tlsCopy.push(data)
        } else {
          this.$set(this.tlsCopy, this.tls.index, data)
        }
        this.$emit('addData', this.tlsCopy)
        this.closeCard()
      }
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.tls.index = -1
      this.$emit('closeOverlay')
    },
    // eslint-disable-next-line vue/no-unused-properties
    expandCard() {
      this.expand = true
    },
  },
}
</script>
