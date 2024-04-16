<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">{{ $t('tip.input') }}</div>
        <BaseACEEditor
          v-model="obj.context"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} kubegems__rounded_small`"
          :height="`${height / 2 - 22}px`"
          lang="plain_text"
          :options="{
            tabSize: 2,
            fontSize: 12,
            printMarginColumn: 100,
            showPrintMargin: false,
            wrap: true,
            readOnly: false,
          }"
          theme="chrome"
          @keydown.stop
        />

        <div class="text-subtitle-1 mb-3">{{ $t('tip.question') }}</div>
        <BaseACEEditor
          v-model="obj.question"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} kubegems__rounded_small`"
          :height="`${height / 2 - 22}px`"
          lang="plain_text"
          :options="{
            tabSize: 2,
            fontSize: 12,
            printMarginColumn: 100,
            showPrintMargin: false,
            wrap: true,
            readOnly: false,
          }"
          theme="chrome"
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
        <div class="text-subtitle-1 mb-3">{{ $t('tip.result') }}</div>
        <pre :style="{ wordBreak: 'break-all', whiteSpace: 'break-spaces' }">{{ rawOut }}</pre>
        <div v-if="!rawOut" class="kubegems__full-center text-subtitle-1" :style="{ marginTop: '-33px' }">
          {{ $root.$t('data.no_data') }}
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../../../i18n';
  import ParamsMixin from '../../mixins/params';

  export default {
    name: 'QuestionAnswer',
    i18n: {
      messages: messages,
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
          context: '',
          question: '',
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
            this.rawOut = '';
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async submitContent() {
        if (!this.obj.context.trim()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.input_text'),
            color: 'warning',
          });
          return;
        }
        if (!this.obj.question.trim()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.input_question'),
            color: 'warning',
          });
          return;
        }
        const data = this.composeInputs(
          this.stringParam('context', this.obj.context),
          this.stringParam('question', this.obj.question),
        );
        const ret = await this.infer(data);
        this.rawOut = this.parseResult(ret);
      },
    },
  };
</script>
