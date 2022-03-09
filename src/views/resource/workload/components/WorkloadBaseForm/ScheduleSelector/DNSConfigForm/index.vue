<template>
  <v-form
    ref="form"
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
          <v-sheet class="pt-2 px-2">
            <v-flex
              class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width"
            >
              <span>nameservers</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__long-width">
              <v-combobox
                v-model="nameservers"
                hide-no-data
                :items="[]"
                :search-input.sync="nameserversText"
                multiple
                small-chips
                label="nameservers(回车)"
                height="32"
                @change="onNameserversChange"
                @keydown.enter="createNameservers"
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
                      @click="removeNameservers(item)"
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
              class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width"
            >
              <span>searches</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__long-width">
              <v-combobox
                v-model="searches"
                hide-no-data
                :items="[]"
                :search-input.sync="searchesText"
                multiple
                small-chips
                label="searches(回车)"
                height="32"
                @change="onSearchesChange"
                @keydown.enter="createSearches"
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
                      @click="removeSearches(item)"
                    >
                      mdi-close
                    </v-icon>
                  </v-chip>
                </template>
              </v-combobox>
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
          <DNSOptionForm
            ref="dnsOptionForm"
            :data="obj.options"
            @addData="addOptionData"
          />
          <BaseSubTitle title="options" />
          <v-card-text class="pa-2">
            <DNSOptionItem
              :options="obj.options"
              @updateOption="updateOption"
              @removeOption="removeOption"
              @expandCard="expandCard"
            />
            <div class="kubegems__clear-float" />
          </v-card-text>
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
import DNSOptionForm from './DNSOptionForm'
import DNSOptionItem from './DNSOptionItem'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'DNSConfigForm',
  components: {
    DNSOptionForm,
    DNSOptionItem,
  },
  props: {
    data: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      dnsConfigCopy: {},
      obj: {
        nameservers: [],
        searches: [],
        options: [],
      },
      nameservers: [],
      nameserversText: '',
      searches: [],
      searchesText: '',
    }
  },
  watch: {
    data() {
      this.dnsConfigCopy = deepCopy(this.data)
    },
  },
  mounted() {
    if (this.data) {
      this.dnsConfigCopy = deepCopy(this.data)
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.obj = data
      if (this.obj.nameservers) {
        this.nameservers = this.obj.nameservers.map((h, index) => {
          return { text: h, value: index }
        })
      }
      if (this.obj.searches) {
        this.searches = this.obj.searches.map((h, index) => {
          return { text: h, value: index }
        })
      }
      this.expand = true
    },
    onNameserversChange() {
      const nameservers = this.nameservers.filter((nameserver) => {
        return nameserver !== '' && typeof nameserver === 'object'
      })
      this.nameservers = nameservers
    },
    createNameservers() {
      if (!this.nameserversText) return
      const index = this.nameservers.length
      this.nameservers.push({
        text: this.nameserversText,
        value: index,
      })
      this.nameserversText = ''
    },
    removeNameservers(item) {
      const nameservers = this.nameservers.filter((nameserver) => {
        return nameserver.value !== item.value
      })
      this.nameservers = nameservers
    },
    onSearchesChange() {
      const searches = this.searches.filter((search) => {
        return search !== '' && typeof search === 'object'
      })
      this.searches = searches
    },
    createSearches() {
      if (!this.searchesText) return
      const index = this.searches.length
      this.searches.push({
        text: this.searchesText,
        value: index,
      })
      this.searchesText = ''
    },
    removeSearches(item) {
      const searches = this.searches.filter((search) => {
        return search.value !== item.value
      })
      this.searches = searches
    },
    addOptionData(data) {
      this.obj.options = data
    },
    updateOption(index) {
      const data = this.obj.options[index]
      this.$nextTick(() => {
        this.$refs.dnsOptionForm.init(data)
      })
    },
    removeOption(index) {
      this.$delete(this.obj.options, index)
    },
    expandCard(formComponent) {
      this.$nextTick(() => {
        this.$refs[formComponent].expand = true
        this.expand = true
      })
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        if (!this.dnsConfigCopy) this.dnsConfigCopy = {}
        this.dnsConfigCopy.nameservers = this.nameservers.map((d) => {
          return d.text
        })
        this.dnsConfigCopy.searches = this.searches.map((d) => {
          return d.text
        })
        this.dnsConfigCopy.options = this.obj.options
        this.$emit('addData', this.dnsConfigCopy)
        this.closeCard()
      }
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.$emit('closeOverlay')
    },
  },
}
</script>
