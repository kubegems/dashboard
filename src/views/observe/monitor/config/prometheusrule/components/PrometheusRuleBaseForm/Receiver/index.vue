<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="告警消息" />
      <v-card-text class="pa-2">
        <v-textarea
          v-model="obj.message"
          class="my-0"
          required
          auto-grow
          label="告警消息"
        />
      </v-card-text>

      <ReceiverForm
        ref="receiverForm"
        :data="obj.receivers"
        :cluster="obj.cluster"
        :namespace="obj.namespace"
        @addData="addData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="接收器配置" />
      <v-card-text class="pa-2">
        <ReceiverItem
          :receivers="obj.receivers"
          @updateReceiver="updateReceiver"
          @removeReceiver="removeReceiver"
          @expandCard="expandCard"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'
import ReceiverItem from './ReceiverItem'
import ReceiverForm from './ReceiverForm'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'Receiver',
  components: { ReceiverItem, ReceiverForm },
  mixins: [BaseSelect, BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      obj: {
        receivers: [],
        message: '',
      },
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
  },
  watch: {
    item() {
      this.obj = deepCopy(this.item)
    },
  },
  mounted() {
    if (this.item) {
      // 如果是更新
      this.obj = this.$_.merge(this.obj, deepCopy(this.item))
      if (this.item.receivers) {
        this.$set(this.obj.receivers, this.item.receivers)
      }
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj.receivers = []
        this.obj = this.$_.merge(this.obj, deepCopy(data))
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    addData(data) {
      this.obj.receivers = data
      this.$refs.receiverForm.closeCard()
    },
    updateReceiver(index) {
      const receiver = this.obj.receivers[index]
      const data = {
        index: index,
        name: receiver.name,
        interval: receiver.interval,
      }

      this.$nextTick(() => {
        this.$refs.receiverForm.init(data)
        this.expand = true
      })
    },
    removeReceiver(index) {
      this.$delete(this.obj.receivers, index)
    },
    expandCard() {
      this.$nextTick(() => {
        this.$refs.receiverForm.expandCard()
        this.expand = true
      })
    },
    closeExpand() {
      this.expand = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.receiverForm.closeCard()
      this.$refs.form.reset()
    },
  },
}
</script>
