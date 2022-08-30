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

        <div class="text-subtitle-1 my-3">问题</div>
        <ACEEditor
          v-model="obj.question"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} kubegems__rounded_small`"
          lang="plain_text"
          :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
          :style="{ height: `200px !important` }"
          theme="chrome"
          @init="$aceinit"
          @keydown.stop
        />
      </v-col>

      <v-btn class="kubegems__full-center" color="primary" icon :loading="Circular" x-large @click="submitContent">
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
  import { mapState } from 'vuex';

  import ParamsMixin from '../../mixins/params';
  import { postModelApi } from '@/api';

  export default {
    name: 'TableQuestionAnswer',
    components: {
      VueTableDynamic,
    },
    mixins: [ParamsMixin],
    props: {
      dialog: {
        type: Boolean,
        default: () => true,
      },
      instance: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        obj: {
          question: '',
        },
        params: {
          data: [['data1', 'data2', 'data3', 'data4']],
          border: true,
          edit: {
            row: 'all',
          },
          rowHeight: 48,
        },
        rawOut: '',
      };
    },
    computed: {
      ...mapState(['Scale', 'Circular']),
    },
    watch: {
      dialog: {
        handler(newValue) {
          if (!newValue) {
            this.obj = this.$options.data().obj;
            this.params = this.$options.data().params;
            this.rawOut = '';
          }
        },
        deep: true,
        immediate: true,
      },
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
        if (!this.obj.question.trim()) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请输入问题',
            color: 'warning',
          });
          return;
        }

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

        const inferData = this.composeInputs(
          this.jsonParams('table', data),
          this.stringParam('query', this.obj.question),
        );
        const ret = await postModelApi(this.instance.environment, this.instance.name, inferData);
        const parsed = this.parseOut(ret.data.outputs);
        this.rawOut = parsed.raw_out;
      },
    },
  };
</script>
