<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1">问答表</div>
        <v-btn color="primary" icon small @click="rowadd"> <v-icon small>mdi-table-row-plus-after </v-icon> </v-btn>
        <v-btn color="primary" icon small @click="coladd"> <v-icon small>mdi-table-column-plus-after </v-icon> </v-btn>
        <v-btn color="primary" icon small @click="rowdel"> <v-icon small>mdi-table-row-remove </v-icon> </v-btn>
        <v-btn color="primary" icon small @click="coldel"> <v-icon small>mdi-table-column-remove </v-icon> </v-btn>
        <vue-table-dynamic class="mt-3" :params="params" />

        <div class="text-subtitle-1 my-3">问答</div>
        <v-text-field v-model="question" flat hide-details label="question" solo />
      </v-col>

      <v-btn class="kubegems__full-center" color="primary" icon x-large @click="submitContent">
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6">
        <div class="text-subtitle-1">问答结果</div>
        <pre>{{ rawOut }}</pre>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import VueTableDynamic from 'vue-table-dynamic';

  import ParamsMixin from '../../mixins/params';
  import { postModelApi } from '@/api';

  export default {
    name: 'TableQuestionAnswer',
    components: {
      VueTableDynamic,
    },
    mixins: [ParamsMixin],
    props: {
      instance: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        rawOut: '',
        question: '',
        params: {
          data: [['data1', 'data2', 'data3', 'data4']],
          border: true,
          edit: {
            row: 'all',
          },
          rowHeight: 48,
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
      async submitContent() {
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

        const inferData = this.composeInputs(this.jsonParams('table', data), this.stringParam('query', this.question));
        const ret = await postModelApi(this.instance.environment, this.instance.name, inferData);
        const parsed = this.parseOut(ret.data.outputs);
        this.rawOut = parsed.raw_out;
      },
    },
  };
</script>
