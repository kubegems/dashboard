<template>
  <BaseFullScreenDialog
    v-model="dialog"
    :title="title"
    icon="mdi-history"
    @dispose="clickClose"
  >
    <template #content>
      <div id="log-history">
        <v-card flat>
          <v-card-text class="pl-4 py-1">
            <v-row class="my-1 pa-1">
              <v-col
                cols="12"
                class="pa-1"
              >
                <ClusterSelect
                  ref="clusterSelect"
                  @clusterChange="clusterChange"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-card flat>
          <v-card
            class="overflow-y-auto pa-0 ma-0"
            :height="availableScrollHeight"
            :max-height="availableScrollHeight"
            flat
          >
            <v-data-table
              :headers="headers"
              :items="items"
              :items-per-page="-1"
              no-data-text="暂无数据"
              :sort-by="['CreateAt']"
              :sort-desc="[true]"
              hide-default-footer
              class="px-4"
            >
              <template #[`item.label`]="{ item }">
                <div
                  v-for="(v, k) in item.LabelJSON"
                  :key="k"
                  style="display: inline;"
                >
                  <v-chip
                    v-for="(labelValue, labelIndex) in v"
                    :key="labelIndex"
                    color="success"
                    class="ma-1 font-weight-medium"
                    x-small
                  >
                    <span class="pr-2">标签({{ k }}):{{ labelValue }}</span>
                  </v-chip>
                </div>
                <v-chip
                  v-for="(it, index) in item.FilterJSON"
                  :key="index"
                  color="success"
                  x-small
                  class="ma-1 font-weight-medium"
                >
                  <span class="pr-2">正则(regex):{{ it }}</span>
                </v-chip>
              </template>
              <template #[`item.createAt`]="{ item }">
                <span>
                  {{
                    item.CreateAt ? $moment(item.CreateAt).format('lll') : ''
                  }}
                </span>
              </template>
              <template #[`item.logQL`]="{ item }">
                <span>
                  {{ item.LogQL }}
                </span>
              </template>
              <template #[`item.total`]="{ item }">
                <span>
                  {{ item.Total }}
                </span>
              </template>
              <template #[`item.action`]="{ item }">
                <v-flex class="float-right">
                  <v-btn
                    color="primary"
                    class="my-1"
                    text
                    small
                    @click="queryLogQueryHistory(item)"
                  >
                    查询
                  </v-btn>
                  <v-btn
                    color="error"
                    class="my-1"
                    text
                    small
                    @click="deleteLogQueryHistory(item)"
                  >
                    删除
                  </v-btn>
                </v-flex>
                <div class="kubegems__clear-float" />
              </template>
            </v-data-table>
          </v-card>
        </v-card>
      </div>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
import { mapState } from 'vuex'
import { getLogQueryHistoryList, deleteLogQueryHistory } from '@/api'
import ClusterSelect from './ClusterSelect'

export default {
  name: 'LogHistory',
  components: { ClusterSelect },
  mixins: [],
  props: {},
  data: () => ({
    dialog: false,
    title: '查询历史',
    items: [],
    headers: [
      { text: 'LogQL', value: 'logQL', align: 'start', sortable: false },
      { text: '查询标签', value: 'label', align: 'start', sortable: false },
      { text: '最近查询时间', value: 'createAt', align: 'start', width: 200 },
      { text: '频次', value: 'total', align: 'start', width: 100 },
      { text: '', value: 'action', align: 'end', width: 140, sortable: false },
    ],
    currentCluster: null,
  }),
  computed: {
    ...mapState(['JWT', 'Scale']),
    availableScrollHeight() {
      return (window.innerHeight - 64 - 1 - 80) / this.Scale
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init() {
      if (this.JWT) {
        await this.$refs.clusterSelect.generateClusters()
      }
    },
    async logQueryHistoryList() {
      this.items = []
      const data = await getLogQueryHistoryList(this.currentCluster.value)
      if (data && data.length > 0) {
        data.forEach((item) => {
          item.LabelJSON = this.parseLabel(item.LogQL)
          item.FilterJSON = this.parseFilter(item.LogQL)
          this.items.push(item)
        })
      }
    },
    async deleteLogQueryHistory(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除历史`,
        content: {
          text: item.LogQL,
          type: 'confirm',
        },
        doFunc: async () => {
          const ids = item.Ids.split(',').reduce(
            (pre, current, index, arr) =>
              pre + `lid=${current}` + `${index === arr.length - 1 ? '' : '&'}`,
            '',
          )
          await deleteLogQueryHistory(ids)
          this.logQueryHistoryList()
        },
      })
    },
    parseLabel(input) {
      const labelMatchArr = input.match(new RegExp('{(.*)}'))
      if (labelMatchArr && labelMatchArr.length > 1) {
        const labelArr = labelMatchArr[1].split(',')
        const labelValueObj = {}
        labelArr.forEach((item) => {
          if (item.indexOf('=~') !== -1) {
            const label = item.split('=~')[0]
            labelValueObj[label] = item
              .split('=~')[1]
              .match(new RegExp('"(.*)"'))[1]
              .split('|')
          } else {
            const label = item.split('=')[0]
            labelValueObj[label] = [
              item.split('=')[1].match(new RegExp('"(.*)"'))[1],
            ]
          }
        })
        return labelValueObj
      } else {
        return {}
      }
    },
    parseFilter(input) {
      const filterList = []
      const matchedArr = input.match(new RegExp('{.*}(.*)'))
      if (matchedArr && matchedArr.length > 1) {
        const filterArr = matchedArr[1].trim().split('|~')
        filterArr.forEach((item) => {
          if (item !== '') {
            const match = item.match(new RegExp('`(.*)`'))
            if (match && match.length > 0) {
              filterList.push(match[1])
            }
          }
        })
      }
      return filterList
    },
    queryLogQueryHistory(item) {
      const label = item.LabelJSON
      const filter = item.FilterJSON
      const logQL = item.LogQL
      this.$router.replace({
        query: Object.assign(
          { labels: label },
          { filters: filter },
          { logQL: logQL },
        ),
      })
      const params = Object.assign(
        { labels: label },
        { filters: filter },
        { logQL: logQL },
      )
      this.$emit('queryLogQueryHistory', params, this.currentCluster)
      this.dialog = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    refresh() {
      this.logQueryHistoryList()
    },
    async clusterChange(cluster) {
      if (!this.currentCluster || this.currentCluster.value !== cluster.value) {
        this.currentCluster = cluster
        if (this.dialog) {
          this.items = []
          await this.logQueryHistoryList()
        }
      }
    },
    clickClose() {
      this.currentCluster = null
      this.items = []
    },
  },
}
</script>

<style lang="scss" scoped>
#log-history {
  height: 100vh;
  overflow: auto;
}

#log-history::-webkit-scrollbar {
  display: block !important;
}
#log-history::-webkit-scrollbar-thumb {
  width: 10px;
  border-radius: 5px;
  background: grey;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
#log-history::-webkit-scrollbar:vertical {
  width: 10px;
}
</style>
