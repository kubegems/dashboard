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
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>路由策略</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.weight"
                  class="my-0"
                  required
                  label="weight"
                  type="number"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.destination.host"
                  class="my-0"
                  required
                  label="host"
                  :rules="objRules.hostRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.destination.subset"
                  class="my-0"
                  required
                  label="subset"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.destination.port.number"
                  class="my-0"
                  required
                  label="port"
                  type="number"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>headers request</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-combobox
                  v-model="reqSet"
                  hide-no-data
                  :items="[]"
                  :search-input.sync="reqSetText"
                  multiple
                  small-chips
                  label="set(回车key[string]:value[string])"
                  height="32"
                  @change="onReqSetChange"
                  @keydown.enter="createReqSet"
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
                        @click="removeReqSet(item)"
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
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-combobox
                  v-model="reqAdd"
                  hide-no-data
                  :items="[]"
                  :search-input.sync="reqAddText"
                  multiple
                  small-chips
                  label="add(回车key[string]:value[string])"
                  height="32"
                  @change="onReqAddChange"
                  @keydown.enter="createReqAdd"
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
                        @click="removeReqAdd(item)"
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
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-combobox
                  v-model="reqRemove"
                  hide-no-data
                  :items="[]"
                  :search-input.sync="reqRemoveText"
                  multiple
                  small-chips
                  label="remove(回车)"
                  height="32"
                  @change="onReqRemoveChange"
                  @keydown.enter="createReqRemove"
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
                        @click="removeReqRemove(item)"
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
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>headers response</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-combobox
                  v-model="resSet"
                  hide-no-data
                  :items="[]"
                  :search-input.sync="resSetText"
                  multiple
                  small-chips
                  label="set(回车key[string]:value[string])"
                  height="32"
                  @change="onResSetChange"
                  @keydown.enter="createResSet"
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
                        @click="removeResSet(item)"
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
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-combobox
                  v-model="resAdd"
                  hide-no-data
                  :items="[]"
                  :search-input.sync="resAddText"
                  multiple
                  small-chips
                  label="add(回车key[string]:value[string])"
                  height="32"
                  @change="onResAddChange"
                  @keydown.enter="createResAdd"
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
                        @click="removeResAdd(item)"
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
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-combobox
                  v-model="resRemove"
                  hide-no-data
                  :items="[]"
                  :search-input.sync="resRemoveText"
                  multiple
                  small-chips
                  label="remove(回车)"
                  height="32"
                  @change="onResRemoveChange"
                  @keydown.enter="createResRemove"
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
                        @click="removeResRemove(item)"
                      >
                        mdi-close
                      </v-icon>
                    </v-chip>
                  </template>
                </v-combobox>
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
      v-for="(route, index) in routeCopy"
      :key="index"
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
                  {{ route.destination.host }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  host
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
                    route.destination.port ? route.destination.port.number : ''
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  port
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ route.weight }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  weight
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
          @click="updateData(index)"
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
          @click="removeData(index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded-0 ma-2">
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
              添加路由策略
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'HTTPRouteDestinationForm',
  props: {
    route: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      obj: {
        index: -1,
        weight: 0,
        destination: {
          host: '',
          subset: '',
          port: {
            number: null,
          },
        },
        headers: {
          request: {
            set: {},
            add: {},
            remove: [],
          },
          response: {
            set: {},
            add: {},
            remove: [],
          },
        },
      },
      objRules: {
        hostRule: [required],
      },
      routeCopy: [],

      reqAdd: [],
      reqAddText: '',
      reqSet: [],
      reqSetText: '',
      reqRemove: [],
      reqRemoveText: '',

      resAdd: [],
      resAddText: '',
      resSet: [],
      resSetText: '',
      resRemove: [],
      resRemoveText: '',
    }
  },
  watch: {
    route() {
      if (this.routeCopy) {
        this.routeCopy = deepCopy(this.route)
      }
    },
  },
  mounted() {
    if (this.routeCopy) {
      this.routeCopy = deepCopy(this.route)
    }
  },
  methods: {
    onReqSetChange() {
      const to = this.reqSet.filter((t) => {
        return Object.prototype.hasOwnProperty.call(t, 'text')
      })
      this.reqSet = to
    },
    createReqSet() {
      if (!this.reqSetText) return
      const i = this.reqSet.length
      this.reqSet.push({
        text: this.reqSetText,
        value: i,
      })
      this.reqSetText = ''
    },
    removeReqSet(item) {
      const to = this.reqSet.filter((t) => {
        return t.value !== item.value
      })
      this.reqSet = to
    },

    onReqAddChange() {
      const to = this.reqAdd.filter((t) => {
        return Object.prototype.hasOwnProperty.call(t, 'text')
      })
      this.reqAdd = to
    },
    createReqAdd() {
      if (!this.reqAddText) return
      const i = this.reqAdd.length
      this.reqAdd.push({
        text: this.reqAddText,
        value: i,
      })
      this.reqAddText = ''
    },
    removeReqAdd(item) {
      const to = this.reqAdd.filter((t) => {
        return t.value !== item.value
      })
      this.reqAdd = to
    },

    onReqRemoveChange() {
      const to = this.reqRemove.filter((t) => {
        return Object.prototype.hasOwnProperty.call(t, 'text')
      })
      this.reqRemove = to
    },
    createReqRemove() {
      if (!this.reqRemoveText) return
      const i = this.reqRemove.length
      this.reqRemove.push({
        text: this.reqRemoveText,
        value: i,
      })
      this.reqRemoveText = ''
    },
    removeReqRemove(item) {
      const to = this.reqRemove.filter((t) => {
        return t.value !== item.value
      })
      this.reqRemove = to
    },

    onResSetChange() {
      const to = this.resSet.filter((t) => {
        return Object.prototype.hasOwnProperty.call(t, 'text')
      })
      this.resSet = to
    },
    createResSet() {
      if (!this.resSetText) return
      const i = this.resSet.length
      this.resSet.push({
        text: this.resSetText,
        value: i,
      })
      this.resSetText = ''
    },
    removeResSet(item) {
      const to = this.resSet.filter((t) => {
        return t.value !== item.value
      })
      this.resSet = to
    },

    onResAddChange() {
      const to = this.resAdd.filter((t) => {
        return Object.prototype.hasOwnProperty.call(t, 'text')
      })
      this.resAdd = to
    },
    createResAdd() {
      if (!this.resAddText) return
      const i = this.resAdd.length
      this.resAdd.push({
        text: this.resAddText,
        value: i,
      })
      this.resAddText = ''
    },
    removeResAdd(item) {
      const to = this.resAdd.filter((t) => {
        return t.value !== item.value
      })
      this.resAdd = to
    },

    onResRemoveChange() {
      const to = this.resRemove.filter((t) => {
        return Object.prototype.hasOwnProperty.call(t, 'text')
      })
      this.resRemove = to
    },
    createResRemove() {
      if (!this.resRemoveText) return
      const i = this.resRemove.length
      this.resRemove.push({
        text: this.resRemoveText,
        value: i,
      })
      this.resRemoveText = ''
    },
    removeResRemove(item) {
      const to = this.resRemove.filter((t) => {
        return t.value !== item.value
      })
      this.resRemove = to
    },

    expandCard() {
      this.expand = true
    },
    closeCard() {
      this.expand = false
      this.obj = deepCopy(this.$options.data().obj)
      this.$refs.form.resetValidation()
      this.reqAdd = []
      this.reqAddText = ''
      this.reqSet = []
      this.reqSetText = ''
      this.reqRemove = []
      this.reqRemoveText = ''
      this.resAdd = []
      this.resAddText = ''
      this.resSet = []
      this.resSetText = ''
      this.resRemove = []
      this.resRemoveText = ''
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        const data = deepCopy(this.obj)
        this.reqAdd.forEach((d) => {
          if (d.text.indexOf(':') > -1) {
            const v = d.text.split(':')
            data.headers.request.add[v[0]] = v[1]
          }
        })
        this.reqSet.forEach((d) => {
          if (d.text.indexOf(':') > -1) {
            const v = d.text.split(':')
            data.headers.request.set[v[0]] = v[1]
          }
        })
        data.headers.request.remove = this.reqRemove.map((d) => {
          return d.text
        })
        this.resAdd.forEach((d) => {
          if (d.text.indexOf(':') > -1) {
            const v = d.text.split(':')
            data.headers.response.add[v[0]] = v[1]
          }
        })
        this.resSet.forEach((d) => {
          if (d.text.indexOf(':') > -1) {
            const v = d.text.split(':')
            data.headers.response.set[v[0]] = v[1]
          }
        })
        data.headers.response.remove = this.resRemove.map((d) => {
          return d.text
        })
        delete data['index']
        if (this.obj.index === -1) {
          this.routeCopy.push(data)
        } else {
          this.$set(this.routeCopy, this.obj.index, data)
        }
        this.$emit('updateComponentData', this.routeCopy)
        this.closeCard()
      }
    },
    removeData(index) {
      this.$delete(this.routeCopy, index)
      this.$emit('updateComponentData', this.routeCopy)
    },
    updateData(index) {
      this.obj = deepCopy(this.routeCopy[index])
      this.obj = { ...this.obj, index: index }
      if (
        this.obj.headers &&
        this.obj.headers.request &&
        this.obj.headers.request.add
      ) {
        Object.keys(this.obj.headers.request.add).forEach((key, index) => {
          this.reqAdd.push({
            text: `${key}:${this.obj.headers.request.add[key]}`,
            value: index,
          })
        })
      }
      if (
        this.obj.headers &&
        this.obj.headers.request &&
        this.obj.headers.request.set
      ) {
        Object.keys(this.obj.headers.request.set).forEach((key, index) => {
          this.reqSet.push({
            text: `${key}:${this.obj.headers.request.set[key]}`,
            value: index,
          })
        })
      }
      if (
        this.obj.headers &&
        this.obj.headers.request &&
        this.obj.headers.request.remove
      ) {
        this.obj.headers.request.remove.forEach((d, index) => {
          this.reqRemove.push({
            text: d,
            value: index,
          })
        })
      }
      if (
        this.obj.headers &&
        this.obj.headers.response &&
        this.obj.headers.response.add
      ) {
        Object.keys(this.obj.headers.response.add).forEach((key, index) => {
          this.resAdd.push({
            text: `${key}:${this.obj.headers.response.add[key]}`,
            value: index,
          })
        })
      }
      if (
        this.obj.headers &&
        this.obj.headers.response &&
        this.obj.headers.response.set
      ) {
        Object.keys(this.obj.headers.response.set).forEach((key, index) => {
          this.resSet.push({
            text: `${key}:${this.obj.headers.response.set[key]}`,
            value: index,
          })
        })
      }
      if (
        this.obj.headers &&
        this.obj.headers.response &&
        this.obj.headers.response.remove
      ) {
        this.obj.headers.response.remove.forEach((d, index) => {
          this.resRemove.push({
            text: d,
            value: index,
          })
        })
      }
      this.expandCard()
    },
  },
}
</script>
