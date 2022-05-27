<template>
  <v-flex>
    <v-row>
      <v-col
        v-for="(data, index) in args"
        :key="index"
        class="pa-0"
        cols="6"
      >
        <v-flex class="grey lighten-4 rounded mt-3 mx-3">
          <v-list-item>
            <v-list-item-content class="kubegems__label-class-padding kubegems__break-all">
              <strong class="mr-2 primary--text py-1"> {{ data.name }} </strong>
              {{ data.value }}&nbsp;
            </v-list-item-content>

            <v-btn
              dark
              text
              fab
              right
              x-small
              color="primary"
              @click="updateArgs(index)"
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
              @click="removeArgs(index)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item>
        </v-flex>
      </v-col>
    </v-row>
    <v-flex class="grey lighten-4 rounded mt-6">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn
              text
              color="primary"
              @click="expandCard"
            >
              <v-icon
                left
                small
              >
                mdi-plus
              </v-icon>
              添加参数
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
import BaseResource from '@/mixins/resource'

export default {
  name: 'ArgsItem',
  mixins: [BaseResource],
  props: {
    args: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    updateArgs(index) {
      this.$emit('updateArgs', index)
    },
    removeArgs(index) {
      this.$emit('removeArgs', index)
    },
    expandCard() {
      this.$emit('expandCard', 'argsItem')
    },
  },
}
</script>
