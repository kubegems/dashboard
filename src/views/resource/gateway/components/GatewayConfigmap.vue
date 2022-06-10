<template>
  <div>
    <v-flex v-for="(d, key) in data" :key="key">
      <v-card flat class="pa-4 mt-3">
        <v-card-text class="pa-0">
          <BaseSubTitle :title="key" color="primary" :divider="false" />
          <pre class="kubegems__data-pre rounded">{{ d }}</pre>
        </v-card-text>
      </v-card>
    </v-flex>
  </div>
</template>

<script>
  export default {
    name: 'GatewayConfigmap',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        data: {},
      };
    },
    watch: {
      item() {
        this.data = this.item.spec.configMapData ? this.item.spec.configMapData : {};
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.data = this.item.spec.configMapData ? this.item.spec.configMapData : {};
      });
    },
  };
</script>
