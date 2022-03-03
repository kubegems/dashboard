<template>
  <v-card>
    <v-card-title class="primary--text">{{ data.metadata.name }}</v-card-title>
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
  name: 'SideDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
}
</script>
