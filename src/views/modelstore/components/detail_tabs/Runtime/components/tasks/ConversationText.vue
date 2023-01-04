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

      <v-btn class="kubegems__full-center" color="primary" icon :loading="Circular" x-large @click="submitContent">
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6" :style="{ position: 'relative' }">
        <div class="text-subtitle-1 mb-3">{{ $t('tip.output') }}</div>
        <pre>{{ output }}</pre>
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
    name: 'ConversationText',
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
          textContent: '',
        },
        output: '',
        conversation: {
          uuid: '',
          generated_responses: [],
          past_user_inputs: [],
        },
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
      async submitContent() {
        if (!this.obj.textContent.trim()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.input_text'),
            color: 'warning',
          });
          return;
        }
        const data = this.composeInputs(
          this.conversationParam('array_inputs', {
            new_user_input: this.obj.textContent,
            uuid: this.conversation.uuid,
            generated_responses: this.conversation.generated_responses,
            past_user_inputs: this.conversation.past_user_inputs,
          }),
        );
        const ret = this.infer(data);
        this.output = JSON.parse(ret.outputs[0].data);
        this.conversation.uuid = this.output.uuid;
      },
    },
  };
</script>
