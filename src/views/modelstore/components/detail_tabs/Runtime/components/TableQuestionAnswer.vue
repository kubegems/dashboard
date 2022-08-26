<template>
  <v-container>
    <v-row>
      <!-- <vue-table-dynamic :params="params" /> -->
      <v-text-field v-model="question" />
      <v-btn @click="rowadd"> add row </v-btn>
      <v-btn @click="coladd"> add col </v-btn>
      <v-btn @click="rowdel"> del row </v-btn>
      <v-btn @click="coldel"> del col </v-btn>
      <v-btn @click="getTableData"> submit </v-btn>
    </v-row>
    <v-spacer />
    <v-row align="start">
      <v-col cols="24" md="12">
        <span> output preview </span>
      </v-col>
      <v-col cols="24" md="12">
        <span v-if="output"> {{ output }} </span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  // import VueTableDynamic from 'vue-table-dynamic';

  import ParamsMixin from '../mixins/params';

  export default {
    name: 'TableQuestionAnswer',
    components: {
      // VueTableDynamic,
    },
    mixins: [ParamsMixin],
    data() {
      return {
        output: '',
        question: 'how old is brad?',
        params: {
          data: [
            ['actors', 'age', 'number of movies', 'date of birth'],
            ['brad pitt', '56', '87', '7 february 1967'],
            ['leonardo di caprio', '45', '53', '10 june 1996'],
            ['george clooney', '59', '69', '28 november 1967'],
          ],
          border: true,
          edit: {
            row: 'all',
          },
        },
      };
    },
    methods: {
      rowadd() {
        const rowlen = this.params.data[0].length;
        const arr = Array(rowlen).fill('');
        this.params.data.push(arr);
      },
      rowdel() {
        if (this.params.data.length == 1) {
          return;
        }
        this.params.data.pop();
      },
      coladd() {
        for (const index in this.params.data) {
          this.params.data[index].push('');
        }
      },
      coldel() {
        if (this.params.data[0].length == 1) {
          return;
        }
        for (const index in this.params.data) {
          this.params.data[index].pop();
        }
      },
      async getTableData() {
        const data = {};
        const header = this.params.data[0];
        const dataarea = this.params.data.slice(1);
        for (const index in header) {
          const key = header[index];
          const vals = [];
          for (const idx in dataarea) {
            vals.push(dataarea[idx][index]);
          }
          data[key] = vals;
        }

        const inferParam = this.composeInputs(this.jsonParams('table', data), this.stringParam('query', this.question));
        const ret = await infer(inferParam);
        for (const out of ret.data.outputs) {
          this.output = out.data;
        }
      },
    },
  };
</script>
