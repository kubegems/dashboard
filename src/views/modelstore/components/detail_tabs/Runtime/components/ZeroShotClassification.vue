<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-row>
          <v-col cols="12" md="12">
            <v-textarea v-model="textContent" filled label="文本内容" />
          </v-col>
        </v-row>
        <v-row>
          <!-- <vue-tags-input v-model="tag" :tags="tags" @tags-changed="(newTags) => (tags = newTags)" /> -->
        </v-row>
        <v-row>
          <v-btn primary @click="submitContent"> 提交 </v-btn>
        </v-row>
      </v-col>
      <v-divider vertical />
      <v-col cols="12" md="6">
        <v-row align="start">
          <v-col cols="24" md="12">
            <span> output preview </span>
          </v-col>
          <v-col cols="24" md="12">
            <span v-if="output"> {{ output }} </span>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  // import VueTagsInput from '@johmun/vue-tags-input';

  import ParamsMixin from '../mixins/params';

  export default {
    name: 'ZeroShotClassification',
    components: {
      // VueTagsInput,
    },
    mixins: [ParamsMixin],
    data() {
      return {
        textContent: '',
        output: '',
        // tag: '',
        tags: [],
      };
    },
    methods: {
      async submitContent() {
        const tags = [];
        this.tags.forEach((el) => {
          tags.push(el.text);
        });
        const data = this.composeInputs(
          this.stringParam('sequences', this.textContent),
          this.jsonParams('candidate_labels', tags),
        );
        const ret = await infer(data);
        for (const out of ret.data.outputs) {
          this.output = out.data;
        }
      },
    },
  };
</script>
