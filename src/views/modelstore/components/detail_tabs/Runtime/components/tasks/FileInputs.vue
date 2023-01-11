<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1">{{ $t('tip.voice') }}</div>
        <v-file-input accept="*/*" counter filled flat :label="$t('tip.voice')" show-size solo @change="onFileChange" />
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

      <v-col class="pl-8" cols="12" md="6" :style="{ position: 'relative', height: `${height}px` }">
        <div class="text-subtitle-1">{{ $t('tip.result') }}</div>
        <pre :style="{ wordBreak: 'break-all', whiteSpace: 'break-spaces' }">{{ rawOut }}</pre>
        <div v-if="!rawOut" class="kubegems__full-center text-subtitle-1" :style="{ marginTop: '-8px' }">
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
    name: 'FineInputs',
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
    data: () => {
      return {
        obj: {
          file: null,
        },
        rawOut: null,
      };
    },
    computed: {
      ...mapState(['Circular']),
      height() {
        return window.innerHeight - 12;
      },
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
      onFileChange(e) {
        if (e) {
          this.obj.file = e;
        } else {
          this.obj.file = null;
        }
        this.rawOut = null;
      },
      async submitContent() {
        if (!this.obj.file) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.upload_voice_tip'),
            color: 'warning',
          });
          return;
        }
        const _v = this;
        const reader = new FileReader();
        reader.onloadend = async function () {
          const b64data = reader.result.split(',')[1];
          const data = _v.composeInputs(_v.audioParam('inputs', b64data));
          let ret = await _v.infer(data);
          _v.rawOut = _v.parseResult(ret);
        };
        reader.readAsDataURL(_v.obj.file);
      },
    },
  };
</script>
