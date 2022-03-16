<template>
  <v-sheet>
    <v-row>
      <v-col cols="6">
        <Card title="ClusterOutput">
          <v-autocomplete
            v-model="globalOutputRefs"
            :items="clusterOutputSelect"
            :loading="clusterOutputLoading"
            multiple
            label="globalOutputRefs"
            no-data-text="暂无可选数据"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </Card>
      </v-col>
      <v-col cols="6">
        <Card title="Output">
          <v-autocomplete
            v-model="localOutputRefs"
            :items="outputSelect"
            :loading="outputLoading"
            multiple
            attach
            label="localOutputRefs"
            no-data-text="暂无可选数据"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </Card>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getOutputsDataByTenant, getOutputsData, getClusterOutputsData } from '@/api'
import { deepCopy } from '@/utils/helpers'
import Card from '@/views/observe/log/operator/components/Card'

export default {
  name: 'OutputForm',
  components: {
    Card,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      outputSelect: [],
      outputLoading: false,
      clusterOutputSelect: [],
      clusterOutputLoading: false,
      globalOutputRefs: [],
      localOutputRefs: [],
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    ...mapGetters(['Tenant']),
  },
  watch: {
    data: {
      handler(newValue) {
        this.globalOutputRefs = newValue.spec?.globalOutputRefs || []
        this.localOutputRefs = newValue.spec?.localOutputRefs || []
      },
      immediate: true,
    },
  },
  mounted() {
    this.getClusterOutputList()
    this.getOutputList()
  },
  beforeDestroy() {
    this.onUpdateData()
  },
  methods: {
    async getClusterOutputList () {
      this.clusterOutputLoading = true
      const { cluster, namespace } = this.$route.query
      const data = await getClusterOutputsData(cluster, namespace, { size: 1000, noprocessing: true })
      this.clusterOutputSelect = data.List.map((item) => {
        return {
          text: `${item.metadata.name}`,
          value: item.metadata.name,
        }
      })
      this.clusterOutputLoading = false
    },
    async getOutputList () {
      this.outputLoading = true
      let list = []
      const { cluster, namespace } = this.$route.query
      if (this.AdminViewport) {
        const data = await getOutputsData(cluster, namespace, { size: 1000, noprocessing: true })
        list = data.List
      } else {
        const data = await getOutputsDataByTenant(cluster, this.Tenant().TenantName, { size: 1000, noprocessing: true })
        list = data
      }
      this.outputSelect = list.map((item) => {
        return {
          text: `${item.metadata.name}`,
          value: item.metadata.name,
        }
      })
      this.outputLoading = false
    },
    onUpdateData() {
      const data = deepCopy(this.data)
      data.spec.globalOutputRefs = this.globalOutputRefs
      data.spec.localOutputRefs = this.localOutputRefs
      this.$emit('update:data', data)
    },
  },
}
</script>
