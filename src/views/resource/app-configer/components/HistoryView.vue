<template>
  <div class="text-center">
    <v-dialog
      v-model="show"
      fullscreen
      persistent
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-title> 配置项历史 </v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <v-btn
              text
              @click="close"
            >
              关闭
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-title class="text-h5 blue lighten-5">
          <v-row>
            <v-col>
              <v-text-field
                label="租户"
                :value="historyItem.tenant"
                disabled
              />
            </v-col>
            <v-col>
              <v-text-field
                label="项目"
                :value="historyItem.project"
                disabled
              />
            </v-col>
            <v-col>
              <v-text-field
                label="环境"
                :value="historyItem.environment"
                disabled
              />
            </v-col>
            <v-col>
              <v-text-field
                :value="historyItem.application"
                label="应用"
                disabled
              />
            </v-col>
            <v-col>
              <v-text-field
                :value="historyItem.key"
                label="key"
                disabled
              />
            </v-col>
          </v-row>
        </v-card-title>
        <v-data-iterator
          :items="history"
          disable-pagination
          disable-filtering
          hide-default-footer
        >
          <template #default="props">
            <v-simple-table>
              <thead>
                <tr>
                  <th class="text-left">
                    rev
                  </th>
                  <th class="text-left">
                    update time
                  </th>
                  <th class="text-left" />
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="(item, idx) in props.items"
                >
                  <tr :key="idx">
                    <td>{{ item.rev }} </td>
                    <td>{{ item.last_update_time }}</td>
                    <td>
                      <v-row
                        v-if="idx !== 0"
                      >
                        <v-col>
                          <v-btn
                            small
                            :color=" item.expanded ? 'green' : 'primary'"
                            class="ma-md-2"
                            @click="expandItem(idx)"
                          >
                            {{ item.expanded ? "hide diff" : "show diff" }}
                          </v-btn>
                        </v-col>
                        <v-col>
                          <v-btn
                            small
                            color="primary"
                            class="ma-md-2"
                            @click="rollback(item)"
                          >
                            回滚
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row v-else> <span> 当前应用的配置 </span></v-row>
                    </td>
                  </tr>
                  <tr
                    v-show="item.expanded"
                    :key="idx + 'content'"
                  >
                    <td colspan="3">
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
    </v-dialog>
  </div>
</template>

<script>
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
      show: false,
      history: [],
      latestContent: "",
    }
  },
  watch: {
    showHistoryDialog(val) {
      if (val) {
        this.show = true
      } else {
        this.show = false
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
      console.log(content)
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
  },
}
</script>
