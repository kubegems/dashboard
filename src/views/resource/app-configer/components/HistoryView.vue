<template>
  <BaseFullScreenDialog
    v-model="dialog"
    title="配置项历史"
    icon="fas fa-list-ol"
    @dispose="dispose"
  >
    <template #header>
      <div>
        租户: {{ historyItem.tenant }}
        项目: {{ historyItem.project }}
        环境: {{ historyItem.environment }}
        应用: {{ historyItem.application }}
        Key: {{ historyItem.key }}
      </div>
    </template>
    <template #content>
      <v-card class="px-3">
        <v-data-iterator
          :items="history"
          disable-pagination
          disable-filtering
          hide-default-footer
        >
          <template #default="props">
            <v-simple-table :height="height">
              <thead>
                <tr>
                  <th
                    class="text-center"
                    width="200"
                  >
                    版本号
                  </th>
                  <th class="text-left">
                    更新时间
                  </th>
                  <th
                    class="text-end"
                    width="170"
                  />
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="(item, idx) in props.items"
                >
                  <tr :key="idx">
                    <td class="text-center">{{ item.rev }} </td>
                    <td>{{ $moment(item.last_update_time).format('lll') }}</td>
                    <td>
                      <v-row
                        v-if="idx !== 0"
                      >
                        <v-col>
                          <v-btn
                            small
                            text
                            :color=" item.expanded ? 'green' : 'primary'"
                            class="ma-md-2"
                            @click="expandItem(idx)"
                          >
                            <v-icon small>mdi-vector-difference</v-icon>
                            diff
                          </v-btn>
                        </v-col>
                        <v-col>
                          <v-flex :id="`rh${item.rev}`" />
                          <v-menu
                            left
                            :attach="`#rh${item.rev}`"
                          >
                            <template #activator="{ on }">
                              <v-btn
                                small
                                icon
                                class="mt-2"
                              >
                                <v-icon
                                  x-small
                                  color="primary"
                                  v-on="on"
                                >
                                  fas fa-ellipsis-v
                                </v-icon>
                              </v-btn>
                            </template>
                            <v-card>
                              <v-card-text class="pa-2">
                                <v-flex>
                                  <v-btn
                                    small
                                    text
                                    color="primary"
                                    @click="rollback(item)"
                                  >
                                    回滚
                                  </v-btn>
                                </v-flex>
                              </v-card-text>
                            </v-card>
                          </v-menu>
                        </v-col>
                      </v-row>
                      <v-row v-else> <span> 当前应用的配置 </span></v-row>
                    </td>
                  </tr>
                  <tr
                    v-show="item.expanded"
                    :key="idx + 'content'"
                  >
                    <td
                      colspan="3"
                      class="px-0"
                    >
                      <CodeDiff
                        output-format="side-by-side"
                        is-show-no-change
                        :file-name="item.key"
                        :old-string="latestContent"
                        :new-string="item.value"
                      />
                    </td>
                  </tr>
                </template>
              </tbody>
            </v-simple-table>
          </template>
        </v-data-iterator>
      </v-card>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
import { mapState } from 'vuex'
import { itemHistory, itemDetail, pubConfigItems } from '../api/index.js';

import { CodeDiff } from 'v-code-diff'

export default {
  name: "HistoryView",
  components: {
    CodeDiff,
  },
  props: {
    showHistoryDialog: {
      type: Boolean,
      default: false,
    },
    historyItem: {
      type: Object,
      default: () => {
        return {
          tenant: "",
          project: "",
          environment: "",
          application: "",
          key: "",
          value: "",
        }
      },
    },
  },
  data() {
    return {
      dialog: false,
      history: [],
      latestContent: "",
    }
  },
  computed: {
    ...mapState(['JWT', 'Scale']),
    height() {
      return parseInt((window.innerHeight - 64) / this.Scale)
    },
  },
  watch: {
    showHistoryDialog(val) {
      if (val) {
        this.dialog = true
      } else {
        this.dialog = false
      }
    },
    historyItem() {
      this.getHistory()
    },
  },
  methods: {
    close() {
      this.$emit("close")
    },
    async getHistory() {
      if (this.historyItem && this.historyItem.key) {
        const histories = await itemHistory(
          this.historyItem.tenant,
          this.historyItem.project,
          this.historyItem.application,
          this.historyItem.environment,
          this.historyItem.key,
        )
        histories.forEach(item => {
          item.value = ""
          item.expanded = false
        })
        this.history = histories
        if (this.history.length > 0) {
          const detail = await itemDetail(
            this.historyItem.tenant,
            this.historyItem.project,
            this.historyItem.application,
            this.historyItem.environment,
            this.historyItem.key,
            this.history[0].rev,
          )
          this.latestContent = detail.value
        }
      } else {
        this.history = []
      }
    },
    async getHistoryDetail(rev) {
      const detail = await itemDetail(
        this.historyItem.tenant,
        this.historyItem.project,
        this.historyItem.application,
        this.historyItem.environment,
        this.historyItem.key,
        rev,
      )
      return detail.value
    },
    async expandItem(idx) {
      if (this.history[idx].expanded) {
        this.history[idx].expanded = false
      } else {
        this.history[idx].expanded = true
        const detail = await this.getHistoryDetail(this.history[idx].rev)
        this.history[idx].value = detail
      }
    },
    async rollback(item) {
      let content = item.value
      if (!content || content.length === 0) {
        content = await this.getHistoryDetail(item.rev)
      }
      this.$store.commit('SET_CONFIRM', {
        title: `确认回滚配置项到版本 ${item.rev} ?`,
        content: {
          text: `回滚配置 ${this.historyItem.key} 到版本 ${item.rev}`,
          type: 'confirm',
        },
        param: { content },
        doFunc: async (param) => {
          const res = await pubConfigItems(
            this.historyItem.tenant,
            this.historyItem.project,
            this.historyItem.application,
            this.historyItem.environment,
            this.historyItem.key,
            param.content,
          )
          if (res.ErrorData) {
            this.$store.commit('SET_SNACKBAR', {
              text: `回滚失败 ${res.ErrorData}`,
              color: 'warning',
            })
          } else {
            this.$store.commit('SET_SNACKBAR', {
              text: '回滚完成',
              color: 'green',
            })
          }
        },
      })
    },
    dispose() {
      this.close()
    },
  },
}
</script>

<style lang="scss" scoped>
.card {
  &__title {
    background-color: #f6f6f6;
  }
}
td {
  position: relative;
}
</style>
