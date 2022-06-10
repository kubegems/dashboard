<template>
  <div>
    <v-sheet
      v-for="(item, index) in containerCopy && containerCopy.ports
        ? containerCopy.ports
        : []"
      :key="index"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.name }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  名称
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.protocol }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  协议
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.containerPort }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  容器端口
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="primary"
          @click="updateData(index)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="error"
          @click="removeData(index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
  </div>
</template>

<script>
export default {
  name: 'Port',
  props: {
    containerCopy: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    updateData(index) {
      this.$emit('updateData', index)
    },
    removeData(index) {
      this.$emit('removeData', index)
    },
  },
}
</script>
