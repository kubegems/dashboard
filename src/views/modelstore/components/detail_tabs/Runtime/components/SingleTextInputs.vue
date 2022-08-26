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
  import ParamsMixin from '../mixins/params';

  export default {
    name: 'SingleTextInputs',
    mixins: [ParamsMixin],
    data() {
      return {
        textContent: '',
        output: '',
      };
    },
    methods: {
      async submitContent() {
        const data = this.composeInputs(this.stringParam('inputs', this.textContent));
        const ret = await infer(data);
        for (const out of ret.data.outputs) {
          this.output = out.data;
        }
      },
    },
  };
</script>
