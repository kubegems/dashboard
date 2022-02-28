<template>
  <v-flex>
    <span
      v-for="cluster in clusterSelect"
      :key="cluster.text"
      class="mr-2"
    >
      <v-badge
        :value="
          clusterTotalStreamsNum && clusterTotalStreamsNum[cluster.text]
            ? true
            : false
        "
        bordered
        color="success"
        :content="
          clusterTotalStreamsNum && clusterTotalStreamsNum[cluster.text]
        "
        overlap
        small
      >
        <v-btn
          :class="cluster.selected ? 'item-selected' : 'item-noselected'"
          :color="cluster.selected ? 'primary' : '#424242'"
          depressed
          text
          small
          :disabled="disabled"
          @click="clickCluster(cluster)"
        >
          集群{{ cluster.text }}
        </v-btn>
      </v-badge>
      <span class="hidden">
        {{ clusterTotalStreamsNum ? clusterTotalStreamsNum[cluster.text] : '' }}
      </span>
    </span>
    <v-flex />
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import BaseSelect from '@/mixins/select'

export default {
  name: 'ClusterSelect',
  mixins: [BaseSelect],
  props: {
    clusterTotalStreamsNum: {
      type: Object,
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    currentCluster: {},
  }),

  computed: {
    ...mapState(['JWT', 'AdminViewport']),
    ...mapGetters(['Tenant']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    async generateClusters(refresh = false) {
      if (!this.clusterSelect || this.clusterSelect.length === 0 || refresh) {
        await this.clusterSelectData(
          this.AdminViewport ? null : this.Tenant().ID,
        )
      }
      if (this.clusterSelect.length > 0) {
        this.clusterSelect.forEach((cluster) => {
          this.$set(cluster, 'selected', false)
          cluster.selected = false
        })
        if (Object.keys(this.currentCluster).length === 0) {
          this.currentCluster = this.clusterSelect[0]
          this.$set(this.clusterSelect[0], 'selected', true)
          this.$emit('clusterChange', this.currentCluster)
        } else {
          const clusterIndex = this.clusterSelect.findIndex((c) => {
            return c.value === this.currentCluster.value
          })
          this.$set(this.clusterSelect[clusterIndex], 'selected', true)
          this.$emit('clusterChange', this.currentCluster)
        }
      } else {
        this.$router.push({ name: 'whiteclusterpage' })
        return
      }
    },
    setCurrentCluster(clusterName) {
      if (Object.keys(this.currentCluster).length === 0) {
        const clusterIndex = this.clusterSelect.findIndex((c) => {
          return c.text === clusterName
        })
        this.$set(this.currentCluster, 'text', clusterName)
        this.$set(
          this.currentCluster,
          'value',
          this.clusterSelect[clusterIndex].value,
        )
      }
    },
    async clickCluster(clusterNew) {
      this.clusterSelect.forEach((c) => {
        if (c.value !== clusterNew.value) {
          this.$set(c, 'selected', false)
        } else {
          this.$set(c, 'selected', true)
          this.$emit('refresh')
        }
      })
      if (this.currentCluster.value !== clusterNew.value) {
        this.currentCluster = clusterNew
        this.$emit('clusterChange', this.currentCluster)
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async activeCluster(cluster, useClusterName = false) {
      if (!this.clusterSelect || this.clusterSelect.length === 0) {
        await this.clusterSelectData(
          this.AdminViewport ? null : this.Tenant().ID,
        )
      }
      if (!useClusterName) {
        this.clusterSelect.forEach((c) => {
          if (c.value === cluster.value) {
            this.$set(c, 'selected', true)
          } else {
            this.$set(c, 'selected', false)
          }
        })
      } else {
        this.clusterSelect.forEach((c) => {
          if (c.text === cluster) {
            c.selected = true
            this.setCurrentCluster(c.text)
          } else {
            c.selected = false
          }
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.item-noselected {
  background-color: #f0f4f7;
}
.item-selected {
  background-color: #bbdefb;
}
.hidden {
  visibility: hidden;
}
</style>
