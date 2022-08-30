<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">文本</div>
        <v-textarea v-model="context" auto-grow flat hide-details label="context" rows="15" solo />

        <div class="text-subtitle-1 mb-3">问题</div>
        <v-textarea v-model="question" auto-grow flat hide-details label="question" rows="15" solo />
      </v-col>

      <v-btn class="kubegems__full-center" color="primary" icon x-large @click="submitContent">
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">问答结果</div>
        <pre>{{ rawOut }}</pre>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import ParamsMixin from '../../mixins/params';
  import { postModelApi } from '@/api';

  export default {
    name: 'QuestionAnswer',
    mixins: [ParamsMixin],
    props: {
      instance: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        context: '',
        question: '',
        rawOut: '',
      };
    },
    methods: {
      async submitContent() {
        const data = this.composeInputs(
          this.stringParam('context', this.context),
          this.stringParam('question', this.question),
        );
        const ret = await postModelApi(this.instance.environment, this.instance.name, data);
        const parsed = this.parseOut(ret.data.outputs);
        this.rawOut = parsed.rawOut;
      },
    },
  };
</script>
