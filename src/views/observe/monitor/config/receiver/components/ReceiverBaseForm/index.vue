<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="接收器定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              required
              label="接收器"
              :readonly="edit"
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col
            v-if="AdminViewport"
            cols="6"
          >
            <v-autocomplete
              v-model="namespace"
              color="primary"
              :items="namespaceSelect"
              :rules="objRules.namespaceRule"
              label="命名空间"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              :readonly="edit"
              @focus="onNamespaceSelectFocus(ThisCluster)"
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
        </v-row>
      </v-card-text>
      <ChannelForm
        ref="channelForm"
        :obj="obj"
        :namespace="namespace"
        :type="type"
        :edit="edit"
        :config-index="configIndex"
        @addData="addData"
        @updateData="updateData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="告警渠道" />
      <v-card-text class="pa-2">
        <ChannelItem
          :obj="obj"
          @expandCard="expandCard"
          @removeConfig="removeConfig"
          @updateConfig="updateConfig"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import ChannelForm from './ChannelForm'
import ChannelItem from './ChannelItem'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { k8sName, required } from '@/utils/rules'

export default {
  name: 'ReceiverBaseForm',
  components: {
    ChannelForm,
    ChannelItem,
  },
  mixins: [BaseSelect, BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    valid: false,
    expand: false,
    obj: {
      name: '',
      webhookConfigs: [],
      emailConfigs: [],
    },
    namespace: '',
    type: null,
    configIndex: null,
  }),
  computed: {
    ...mapState(['Admin', 'AdminViewport']),
    ...mapGetters(['Cluster']),
    objRules() {
      return {
        nameRule: [
          required,
          k8sName,
        ],
        namespaceRule: [required],
        selectorRule: [required],
      }
    },
  },
  watch: {
    item() {
      this.obj = this.item
    },
  },
  methods: {
    addData(receiverType, data) {
      switch (receiverType) {
        case 'Email':
          if (!this.obj.emailConfigs) {
            this.$set(this.obj, 'emailConfigs', [])
          }
          this.obj.emailConfigs.push({ ...data })
          break
        case 'Webhook':
          if (!this.obj.webhookConfigs) {
            this.$set(this.obj, 'webhookConfigs', [])
          }
          this.obj.webhookConfigs.push({ ...data })
          break
      }
    },
    updateData(receiverType, index, config) {
      switch (receiverType) {
        case 'Email':
          this.$set(this.obj.emailConfigs, index, { ...config })
          break
        case 'Webhook':
          this.$set(this.obj.webhookConfigs, index, { ...config })
          break
      }
    },
    removeConfig(receiverType, index) {
      switch (receiverType) {
        case 'Email':
          this.$delete(this.obj.emailConfigs, index)
          break
        case 'Webhook':
          this.$delete(this.obj.webhookConfigs, index)
          break
      }
    },
    expandCard() {
      this.$nextTick(() => {
        this.$refs.channelForm.expandCard()
        this.expand = true
      })
    },
    updateConfig(type, index) {
      this.type = type
      this.configIndex = index
      this.$nextTick(() => {
        this.$refs.channelForm.expandCard()
        this.expand = true
        this.$refs.channelForm.init()
      })
    },
    closeExpand() {
      this.expand = false
      // 重置类型选择组件只读属性
      this.type = null
    },
    // eslint-disable-next-line vue/no-unused-properties
    updateNamespaceSelectData() {
      this.namespaceSelectData(this.ThisCluster)
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.channelForm.closeCard()
      this.$refs.form.reset()
      this.obj = {
        name: '',
        webhookConfigs: [],
        emailConfigs: [],
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      let channelLenth = 0
      if (this.obj.webhookConfigs && this.obj.webhookConfigs.length > 0) {
        channelLenth++
      }
      if (this.obj.emailConfigs && this.obj.emailConfigs.length > 0) {
        channelLenth++
      }
      if (channelLenth === 0) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请添加告警渠道',
          color: 'warning',
        })
        return false
      } else {
        return true
      }
    },
    onNamespaceSelectFocus(clusterName) {
      this.namespaceSelectData(clusterName)
    },
  },
}
</script>
