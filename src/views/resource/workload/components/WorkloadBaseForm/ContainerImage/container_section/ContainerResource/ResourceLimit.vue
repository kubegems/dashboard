<template>
  <v-sheet class="grey lighten-4 rounded-0 ma-2">
    <v-list-item two-line>
      <v-list-item-content class="py-2">
        <v-list-item-subtitle class="text-body-2 py-0">
          <v-list-item
            two-line
            class="float-left pa-0 kubegems__form-width"
          >
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1">
                {{
                  containerCopy &&
                    containerCopy.resources &&
                    containerCopy.resources.requests
                    ? containerCopy.resources.requests.cpu==='0'?'无限制':containerCopy.resources.requests.cpu
                    : '无限制'
                }}
                ～
                {{
                  containerCopy &&
                    containerCopy.resources &&
                    containerCopy.resources.limits
                    ? containerCopy.resources.limits.cpu==='0'?'无限制':containerCopy.resources.limits.cpu
                    : '无限制'
                }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1">
                CPU
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            two-line
            class="float-left pa-0 kubegems__form-width"
          >
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1">
                {{
                  containerCopy &&
                    containerCopy.resources &&
                    containerCopy.resources.requests
                    ? containerCopy.resources.requests.memory==='0'?'无限制':containerCopy.resources.requests.memory
                    : '无限制'
                }}
                ～
                {{
                  containerCopy &&
                    containerCopy.resources &&
                    containerCopy.resources.limits
                    ? containerCopy.resources.limits.memory==='0'?'无限制':containerCopy.resources.limits.memory
                    : '无限制'
                }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1">
                内存
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
        @click="updateData"
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
        @click="removeData"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item>
  </v-sheet>
</template>

<script>
export default {
  name: 'ResourceLimit',
  props: {
    containerCopy: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    updateData() {
      this.$emit('updateData')
    },
    removeData() {
      this.$emit('removeData')
    },
  },
}
</script>
