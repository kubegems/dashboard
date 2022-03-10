<template>
  <v-card>
    <div class="text-center pa-4">
      <BaseLogo
        :app-name="name"
        large
        :width="100"
      />
      <h3 class="my-4 text-h6 font-weight-medium primary--text">{{ data.metadata.name }}</h3>
      <v-divider />
    </div>

    <v-list-item two-line>
      <v-list-item-content class="kubegems__detail">
        <v-list-item-title class="text-subtitle-2">插件</v-list-item-title>
        <v-list-item-subtitle class="text-body-2">{{ name }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list-item two-line>
      <v-list-item-content class="kubegems__detail">
        <v-list-item-title class="text-subtitle-2">类型</v-list-item-title>
        <v-list-item-subtitle class="text-body-2">{{ data.kind }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__detail">
        <v-list-item-title class="text-subtitle-2">命名空间</v-list-item-title>
        <v-list-item-subtitle class="text-body-2">{{ data.metadata.namespace }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__detail">
        <v-list-item-title class="text-subtitle-2">创建时间</v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ $moment(data.metadata.creationTimestamp).format('lll') }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script>

export default {
  name: 'OutputInfoPanel',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    name () {
      const data = this.data
      if (!data) return 'loki'
      switch (true) {
        case !!data.spec?.loki:
          return 'loki'
        case !!data.spec?.elasticsearch:
          return 'elasticsearch'
        case !!data.spec?.kafka:
          return 'kafka'
        default:
          return 'other'
      }
    },
  },
}
</script>
