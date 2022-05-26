<template>
  <v-flex>
    <v-row>
      <template v-for="(value, key) in annotations">
        <v-col
          v-if="$ANNOTATION_IGNORE_ARRAY.indexOf(key) === -1"
          :key="key"
          class="pa-0"
          cols="6"
        >
          <v-flex class="grey lighten-4 rounded mt-2 mx-3">
            <v-list-item>
              <v-list-item-content class="kubegems__label-class-padding kubegems__break-all">
                <strong class="mr-2 primary--text py-1"> {{ key }} </strong>
                {{ value }}
              </v-list-item-content>

              <v-btn
                dark
                text
                fab
                right
                x-small
                color="primary"
                @click="updateAnnotations(key)"
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
                @click="removeAnnotations(key)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </v-flex>
        </v-col>
      </template>
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
                mdi-tag-plus
              </v-icon>
              添加注解
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
  name: 'AnnotationItem',
  mixins: [BaseResource],
  props: {
    annotations: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    updateAnnotations(key) {
      this.$emit('updateAnnotations', key)
    },
    removeAnnotations(key) {
      this.$emit('removeAnnotations', key)
    },
    expandCard() {
      this.$emit('expandCard', 'annotationForm')
    },
  },
}
</script>
