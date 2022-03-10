<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="mb-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-sheet class="pt-2 px-2">
          <v-flex
            class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
          >
            <span>命名空间</span>
          </v-flex>
          <v-flex class="float-left ml-2 kubegems__form-width">
            <v-autocomplete
              v-model="namespace"
              :items="namespaceItems"
              :rules="namespaceRule"
              color="primary"
              label="命名空间"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @focus="onNamespaceSelectFocus"
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
import { mapGetters } from 'vuex'
import { namespaceSelectDataFilter } from '@/api'
import BaseSelect from '@/mixins/select'
import { required } from '@/utils/rules'

export default {
  name: 'AddNamespace',
  mixins: [BaseSelect],
  props: {
    data: {
      type: Number,
      default: () => null,
    },
  },
  data: () => ({
    valid: false,
    expand: false,
    namespace: '',
    namespaceItems: [],
    namespaceRule: [required],
  }),
  computed: {
    ...mapGetters(['Tenant']),
    clusterName() {
      const cluster = this.m_select_clusterItems.find((c) => {
        return c.value === this.data
      })
      if (cluster) return cluster.text
      return ''
    },
  },
  async mounted() {
    await this.m_select_clusterSelectData()
  },
  methods: {
    async addData() {
      if (this.$refs.form.validate(true)) {
        this.$emit('addData', this.namespace)
      }
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.$emit('closeOverlay')
    },
    onNamespaceSelectFocus() {
      this.namespaceSelectData()
    },
    async namespaceSelectData() {
      if (!this.clusterName) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请先选择集群',
          color: 'warning',
        })
        return
      }
      const data = await namespaceSelectDataFilter(this.clusterName)
      const namespaceSelect = []
      data.List.forEach((ns) => {
        namespaceSelect.push({
          text: ns.metadata.name,
          value: ns.metadata.name,
        })
      })
      this.namespaceItems = namespaceSelect
    },
  },
}
</script>
