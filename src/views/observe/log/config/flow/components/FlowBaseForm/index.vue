<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-row class="px-2">
      <v-col cols="6">
        <v-autocomplete
          v-model="obj.kind"
          :items="typeItems"
          color="primary"
          label="类型"
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          :readonly="edit"
          :rules="objRules.kindRules"
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
      <v-col cols="6">
        <v-text-field
          v-model="obj.metadata.name"
          class="my-0"
          label="名称"
          required
          :readonly="edit"
          :rules="objRules.nameRules"
        />
      </v-col>
      <v-col cols="6">
        <v-autocomplete
          v-model="obj.spec.localOutputRefs"
          :items="localOutputRefsItems"
          color="primary"
          label="路由器(Output)"
          multiple
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          @change="onFilterChange"
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
      <v-col cols="6">
        <v-autocomplete
          v-model="obj.spec.globalOutputRefs"
          :items="globalOutputRefsItems"
          color="primary"
          label="路由器(ClusterOutput)"
          multiple
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          @change="onFilterChange"
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
      <v-col cols="12">
        <v-autocomplete
          v-model="matchs"
          :items="matchItems"
          color="primary"
          label="匹配应用"
          multiple
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          @change="onMatchChange"
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
      <v-col cols="12">
        <v-autocomplete
          v-model="filters"
          :items="filtersItems"
          color="primary"
          label="过滤器"
          multiple
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          @change="onFilterChange"
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
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import { getClusterOutputsData, getOutputsData } from '@/api'
import BaseSelect from '@/mixins/select'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'FlowBaseForm',
  mixins: [BaseSelect],
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
  data() {
    return {
      valid: false,
      filters: [],
      filtersItems: [
        { text: 'GeoIP', value: 'geoip' },
        { text: 'Parser', value: 'parser' },
        { text: 'RecordModifier', value: 'record_modifier' },
        { text: 'Prometheus', value: 'prometheus' },
        { text: 'Throttle', value: 'throttle' },
      ],
      localOutputRefsItems: [],
      globalOutputRefsItems: [],
      matchs: [],
      matchItems: [],
      obj: {
        apiVersion: 'logging.banzaicloud.io/v1beta1',
        kind: 'Flow',
        metadata: {
          name: undefined,
        },
        spec: {
          match: [],
          filters: [],
          localOutputRefs: [],
          globalOutputRefs: [],
        },
      },
      objRules: {
        kindRules: [required],
        nameRules: [required],
      },
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    typeItems() {
      return [{ text: 'Flow', value: 'Flow' }].concat(
        this.AdminViewport
          ? [{ text: 'ClusterFlow', value: 'ClusterFlow' }]
          : [],
      )
    },
  },
  watch: {
    item: {
      handler() {
        this.loadData()
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    loadData() {
      this.$nextTick(() => {
        this.outputList()
        this.clusterOutputList()
        this.matchList()
        if (!this.item) {
          this.$refs.form.resetValidation()
        } else {
          this.obj = deepCopy(this.item)
        }

        this.filters = this.obj.spec.filters.length > 1 ? this.obj.spec.filters.reduce((f1, f2) => {
          return Array.isArray(f1) ? f1.concat(Object.keys(f2)) : Object.keys(f1).concat(Object.keys(f2))
        }) : this.obj.spec.filters.map(f => { return Object.keys(f) }).flat()

        if (this.obj.spec.match) {
          this.matchs = this.obj.spec.match.length > 1 ? this.obj.spec.match.reduce((m1, m2) => {
            return Array.isArray(m1) ? m1.concat([m2.select.labels.app])
            : [m1.select.labels.app].concat([m2.select.labels.app])
          }) : this.obj.spec.match.map(m => { return m.select.labels.app })
        }
      })
    },
    async outputList() {
      const data = await getOutputsData(this.$route.query.cluster, this.$route.query.namespace, {size: 1000})
      this.localOutputRefsItems = data.List.map(d => {
        return {text: d.metadata.name, value: d.metadata.name}
      })
    },
    async clusterOutputList() {
      const data = await getClusterOutputsData(this.$route.query.cluster, this.$route.query.namespace, {size: 1000})
      this.globalOutputRefsItems = data.List.map(d => {
        return {text: d.metadata.name, value: d.metadata.name}
      })
    },
    async matchList() {
      await this.m_select_workloadSelectData(this.$route.query.cluster, this.$route.query.namespace)
      this.matchItems = this.m_select_workloadSelectItems.map(d => {
        return {text: d.text, value: d.text}
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form && this.$refs.form.resetValidation()
      this.obj = this.$options.data().obj
      this.filters = []
      this.matchs = []
    },
    // eslint-disable-next-line vue/no-unused-properties
    checkSaved() {
      return true
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
    // eslint-disable-next-line vue/no-unused-properties
    getData() {
      return this.obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      return this.$refs.form.validate(true)
    },
    onFilterChange() {
      const filters = this.getFilters()
      this.obj.spec.filters = filters
    },
    getFilters() {
      const filters = []
      this.filters.forEach(f => {
        switch (f) {
          case 'prometheus':
            filters.push({
              prometheus: {
                metrics: [
                  {
                    name: 'logging_entry_count',
                    type: 'counter',
                    desc: 'Total number of log entries generated by either application containers or system components',
                  },
                ],
                labels: {
                  container: '$.kubernetes.container_name',
                  namespace: '$.kubernetes.namespace_name',
                  node: '$.kubernetes.host',
                  pod: '$.kubernetes.pod_name',
                },
              },
            })
            break
          case 'throttle':
            filters.push({
              throttle: {
                group_key: 'throttle_group_key',
                group_bucket_period_s: 10,
                group_bucket_limit: 4000,
              },
            })
            break
          case 'record_modifier':
            filters.push({
              record_modifier: {
                records: [
                  {
                    throttle_group_key: "${record['kubernetes']['namespace_name']+record['kubernetes']['pod_name']}",
                  },
                ],
              },
            })
            break
          case 'geoip':
            filters.push({
              geoip: {
                geoip_lookup_keys: 'remote_addr',
                records: [
                  {
                    city: '${city.names.en["remote_addr"]}',
                    location_array: '\'[${location.longitude["remote"]},${location.latitude["remote"]}]\'',
                    country: '${country.iso_code["remote_addr"]}',
                    country_name: '${country.names.en["remote_addr"]}',
                    postal_code: '${postal.code["remote_addr"]}',
                  },
                ],
              },
            })
            break
          case 'parser':
            filters.push({
              parser: {
                key_name: 'log',
                reserve_data: true,
                remove_key_name_field: true,
                parse: {
                  type: 'json',
                  time_key: 'time',
                  time_format: '%Y-%m-%dT%H:%M:%S.%L%z',
                },
              },
            })
            break
        }
      })
      return filters
    },
    onMatchChange() {
      const matchs = []
      this.matchs.forEach(m => {
        matchs.push({
          select: {
            labels: {
              app: m,
            },
          },
        })
      })
      this.obj.spec.match = matchs
    },
  },
}
</script>
