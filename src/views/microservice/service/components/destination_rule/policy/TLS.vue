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
                <span>TLS</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="obj.mode"
                  color="primary"
                  :items="tlsModeItems"
                  label="mode"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                  :rules="objRules.modeRule"
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
                  v-model="obj.credentialName"
                  color="primary"
                  :items="secretItems"
                  label="credentialName"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                  :rules="objRules.credentialNameRule"
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
        trafficPolicyCopy.tls && JSON.stringify(trafficPolicyCopy.tls) !== '{}'
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
                  {{ trafficPolicyCopy.tls.mode }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  mode
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.tls.credentialName }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  credentialName
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
      class="grey lighten-4 rounded ma-2"
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
              添加TLS
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import { getSecretList } from '@/api'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'TLS',
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
      tlsModeItems: [{ text: 'SIMPLE', value: 'SIMPLE' }],
      secretItems: [],
      obj: {
        mode: 'SIMPLE',
        credentialName: '',
      },
      objRules: {
        modeRule: [required],
        credentialNameRule: [required],
      },
      trafficPolicyCopy: {},
    }
  },
  computed: {
    ...mapState(['EnvironmentFilter']),
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
      this.secretList()
    }
  },
  methods: {
    async secretList() {
      const data = await getSecretList(
        this.EnvironmentFilter.cluster,
        this.EnvironmentFilter.namespace,
        {
          size: 1000,
        },
      )
      this.items = data.List.filter((s) => {
        return s.secret.type === 'kubernetes.io/tls'
      })
      this.items.forEach((v) => {
        v.text = v.secret.metadata.name
        v.value = v.secret.metadata.name
      })
    },
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
        if (!this.trafficPolicyCopy.tls) {
          this.trafficPolicyCopy.tls = {}
        }
        this.trafficPolicyCopy.tls = this.obj
        this.$emit('updateComponentData', this.trafficPolicyCopy)
        this.closeCard()
      }
    },
    removeData() {
      this.$delete(this.trafficPolicyCopy, 'tls')
      this.$emit('updateComponentData', this.trafficPolicyCopy)
    },
    updateData() {
      this.obj = deepCopy(this.trafficPolicyCopy.tls)
      this.expandCard()
    },
  },
}
</script>
