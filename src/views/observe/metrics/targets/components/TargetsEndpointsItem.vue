<template>
  <v-sheet class="grey lighten-4 rounded mb-2 py-2 px-4">
    <div class="d-flex">
      <v-row>
        <v-col cols="3">
          <v-list-item two-line>
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                端口
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1">
                {{ endpoint.port || '-' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col cols="3">
          <v-list-item two-line>
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                路径
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1">
                {{ endpoint.path || '-' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col cols="3">
          <v-list-item two-line>
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                拉取间隔
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1">
                {{ endpoint.interval || '-' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col cols="3">
          <v-list-item two-line>
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                指标标签优先
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1">
                {{ endpoint.honor_labels || '-' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
      </v-row>

      <div class="d-flex align-center">
        <v-btn
          dark
          text
          fab
          x-small
          color="primary"
          @click="onEdit"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          dark
          text
          fab
          x-small
          color="error"
          @click="onDelete"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </div>
  </v-sheet>
</template>

<script>
export default {
  name: 'TargetsEndpointsItem',
  props: {
    endpoint: {
      type: Object,
      default: undefined,
    },
  },
  methods: {
    onEdit () {
      this.$emit('edit')
    },
    onDelete () {
      this.$emit('delete')
    },
  },
}
</script>
