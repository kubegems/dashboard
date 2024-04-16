<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">{{ $t('tip.img') }}</div>

        <div :style="{ height: '620px' }">
          <BaseImagePreview v-model="obj.file" :preview-height="580" />
        </div>

        <div class="text-subtitle-1 mb-3">{{ $t('tip.question') }}</div>
        <BaseACEEditor
          v-model="obj.question"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} kubegems__rounded_small`"
          height="200px"
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
        <div v-if="!rawOut" class="kubegems__full-center text-subtitle-1" :style="{ marginTop: '-7px' }">
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
    name: 'VisualQuestionAnswer',
    mixins: [ParamsMixin],
    i18n: {
      messages: messages,
    },
    props: {
      dialog: {
        type: Boolean,
        default: () => true,
      },
    },
    data: () => {
      return {
        obj: {
          file: null,
          question: '',
        },
        rawOut: null,
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
            this.rawOut = null;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async submitContent() {
        if (!this.obj.file) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.upload_img_tip'),
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

        const _v = this;
        const reader = new FileReader();
        reader.onloadend = async function () {
          const b64data = reader.result;
          const data = _v.composeInputs(_v.jsonParams('args', [{ image: b64data, question: _v.obj.question }]));
          const ret = await _v.infer(data);
          _v.rawOut = _v.parseResult(ret);
        };
        reader.readAsDataURL(_v.obj.file);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .file {
    &__div {
      width: 100%;
      height: 600px;
      border: 1.5px solid #efefef;
      border-radius: 3px;
      position: relative;
    }
  }
</style>
