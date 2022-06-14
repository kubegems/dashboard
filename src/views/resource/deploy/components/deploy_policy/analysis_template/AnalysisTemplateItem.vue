<template>
  <v-flex>
    <v-flex v-if="obj && JSON.stringify(obj) !== '{}'" class="grey lighten-4 rounded my-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left pa-0 kubegems__two-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ obj.templates ? obj.templates.length : 0 }} 个template
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> templates </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__two-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ obj.args ? obj.args.length : 0 }} 个arg
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> args </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateAnalysis">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeAnalysis">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-flex>
    <v-flex v-else class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加{{ title }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AnalysisTemplateItem',
    mixins: [BaseResource],
    props: {
      obj: {
        type: Object,
        default: () => null,
      },
      title: {
        type: String,
        default: () => '',
      },
    },
    methods: {
      updateAnalysis() {
        this.$emit('updateAnalysis');
      },
      removeAnalysis() {
        this.$emit('removeAnalysis');
      },
      expandCard() {
        this.$emit('expandCard', 'analysisTemplateForm');
      },
    },
  };
</script>
