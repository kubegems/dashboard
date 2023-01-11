<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">{{ $t('tip.input') }}</div>
        <ACEEditor
          v-model="obj.textContent"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} kubegems__rounded_small`"
          lang="plain_text"
          :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
          :style="{ height: `${height}px !important` }"
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
        <div class="text-subtitle-1 mb-3">{{ $t('tip.output') }}</div>
        <pre :style="{ wordBreak: 'break-all', whiteSpace: 'break-spaces' }">{{ output }}</pre>
        <div v-if="!output" class="kubegems__full-center text-subtitle-1" :style="{ marginTop: '-30px' }">
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
    name: 'TextInputs',
    i18n: {
      messages: messages,
    },
    mixins: [ParamsMixin],
    props: {
      dialog: {
        type: Boolean,
        default: () => true,
      },
      currentTask: {
        type: String,
        required: true,
        default: '',
      },
    },
    data() {
      return {
        obj: {
          textContent: '',
        },
        output: '',
      };
    },
    computed: {
      ...mapState(['Scale', 'Circular']),
      height() {
        return window.innerHeight - 122;
      },
    },
    watch: {
      dialog: {
        handler(newValue) {
          if (!newValue) {
            this.obj = this.$options.data().obj;
            this.output = '';
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      validInput(content) {
        if (this.currentTask == 'fill-mask') {
          return content.indexOf('<mask>') !== -1;
        } else {
          return true;
        }
      },
      async submitContent() {
        if (!this.validInput(this.obj.textContent)) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.mask_required'),
            color: 'warning',
          });
          return;
        }
        if (!this.obj.textContent.trim()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.input_text'),
            color: 'warning',
          });
          return;
        }
        const data = this.composeInputs(this.stringArrayParam('args', this.obj.textContent));
        const ret = await this.infer(data);
        this.output = this.parseResult(ret);
      },
    },
  };
</script>
