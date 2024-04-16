<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div :style="{ height: `${height / 2}px !important` }">
          <div class="text-subtitle-1">{{ $t('tip.data_table') }}</div>
          <v-btn color="primary" icon small @click="rowadd"> <v-icon small>mdi-table-row-plus-after </v-icon> </v-btn>
          <v-btn color="primary" icon small @click="coladd">
            <v-icon small>mdi-table-column-plus-after </v-icon>
          </v-btn>
          <v-btn color="primary" icon small @click="rowdel"> <v-icon small>mdi-table-row-remove </v-icon> </v-btn>
          <v-btn color="primary" icon small @click="coldel"> <v-icon small>mdi-table-column-remove </v-icon> </v-btn>
          <vue-table-dynamic ref="table" class="mt-3" :params="params" />
        </div>

        <div class="text-subtitle-1 my-3">{{ $t('tip.question') }}</div>
        <BaseACEEditor
          v-model="obj.question"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} kubegems__rounded_small`"
          :height="`${height / 2}px`"
          lang="plain_text"
          :options="{
            tabSize: 2,
            fontSize: 12,
            printMarginColumn: 100,
            showPrintMargin: false,
            wrap: true,
            readOnly: false,
          }"
          @keydown.stop
        />
      </v-col>

      <v-btn
        class="kubegems__full-center"
        color="primary"
        icon
        :loading="Circular"
        :style="{ zIndex: 99 }"
        x-large
        @click="submitContent"
      >
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6" :style="{ position: 'relative' }">
        <div class="text-subtitle-1">{{ $t('tip.result') }}</div>
        <pre :style="{ wordBreak: 'break-all', whiteSpace: 'break-spaces' }">{{ rawOut }}</pre>
        <div v-if="!rawOut" class="kubegems__full-center text-subtitle-1" :style="{ marginTop: '-20px' }">
          {{ $root.$t('data.no_data') }}
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import VueTableDynamic from 'vue-table-dynamic';
  import { mapState } from 'vuex';

  import messages from '../../../../../i18n';
  import ParamsMixin from '../../mixins/params';

  export default {
    name: 'TableQuestionAnswer',
    i18n: {
      messages: messages,
    },
    components: {
      VueTableDynamic,
    },
    mixins: [ParamsMixin],
    props: {
      dialog: {
        type: Boolean,
        default: () => true,
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
      height() {
        return window.innerHeight - 110;
      },
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
            text: this.$t('tip.input_question'),
            color: 'warning',
          });
          return;
        }

        const data = {};
        const currentData = this.$refs.table.getData();
        const header = currentData[0];
        const dataarea = currentData.slice(1);
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
        const ret = await this.infer(inferData);
        this.rawOut = this.parseResult(ret);
      },
    },
  };
</script>
