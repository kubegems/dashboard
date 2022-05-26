<template>
  <v-flex>
    <v-flex
      v-if="obj && JSON.stringify(obj) !== '{}'"
      class="grey lighten-4 rounded my-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__two-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ obj.templates ? obj.templates.length : 0 }} 个template
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  templates
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__two-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ obj.args ? obj.args.length : 0 }} 个arg
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  args
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
          @click="updateAnalysis"
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
          @click="removeAnalysis"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-flex>
    <v-flex
      v-else
      class="grey lighten-4 rounded"
    >
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
              添加{{ title }}
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
  name: 'AnalysisTemplateItem',
  mixins: [BaseResource],
  props: {
    title: {
      type: String,
      default: () => '',
    },
    obj: {
      type: Object,
      default: () => null,
    },
  },
  methods: {
    updateAnalysis() {
      this.$emit('updateAnalysis')
    },
    removeAnalysis() {
      this.$emit('removeAnalysis')
    },
    expandCard() {
      this.$emit('expandCard', 'analysisTemplateForm')
    },
  },
}
</script>
