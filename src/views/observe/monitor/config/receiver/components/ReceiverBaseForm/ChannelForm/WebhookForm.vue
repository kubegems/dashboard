<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    class="my-2"
    @submit.prevent
  >
    <v-card
      class="my-2 pa-2"
      flat
    >
      <v-card-text class="pa-0">
        <v-sheet class="pt-2 px-0">
          <v-flex
            class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
          >
            <span>Webhook</span>
          </v-flex>
          <v-flex class="float-left ml-0 kubegems__long-width">
            <v-text-field
              v-model="webhookConfig.url"
              class="my-0"
              required
              label="URL"
              :rules="webhookConfigRules.urlRule"
            />
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
  </v-form>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'WebhookForm',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    configIndex: {
      type: Number,
      default: () => null,
    },
    obj: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      webhookConfigsCopy: {},
      webhookConfig: {
        url: '',
      },
      webhookConfigRules: {
        urlRule: [required],
      },
    }
  },
  computed: {
    ...mapState(['Admin', 'AdminViewport']),
    ...mapGetters(['Cluster']),
  },
  watch: {
    data() {
      this.webhookConfigsCopy = deepCopy(this.data.webhookConfigs)
    },
  },
  methods: {
    // 更新时调用
    // eslint-disable-next-line vue/no-unused-properties
    init() {
      this.webhookConfig = deepCopy(this.obj.webhookConfigs[this.configIndex])
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        this.$emit('addData', deepCopy(this.webhookConfig))
        this.closeCard()
      }
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.$emit('closeCard')
    },
  },
}
</script>
