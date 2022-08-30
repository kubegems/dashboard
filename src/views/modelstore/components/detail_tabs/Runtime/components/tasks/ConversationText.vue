<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1">文本输入</div>
        <ACEEditor
          v-model="textContent"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
          lang="text"
          :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
          :style="{ height: `${height}px !important` }"
          theme="chrome"
          @init="$aceinit"
          @keydown.stop
        />
      </v-col>

      <v-btn class="kubegems__full-center" color="primary" icon x-large @click="submitContent">
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6">
        <div class="text-subtitle-1">文本输出</div>
        <ACEEditor
          v-model="output"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
          lang="text"
          :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
          :style="{ height: `${height}px !important` }"
          theme="chrome"
          @init="$aceinit"
          @keydown.stop
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import ParamsMixin from '../../mixins/params';
  import { postModelApi } from '@/api';

  export default {
    name: 'ConversationText',
    mixins: [ParamsMixin],
    props: {
      instance: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        textContent: '',
        output: '',
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 110;
      },
    },
    methods: {
      async submitContent() {
        const data = this.composeInputs(this.conversationParam('conversations', { text: this.textContent }));
        const ret = await postModelApi(this.instance.environment, this.instance.name, data);
        for (const out of ret.data.outputs) {
          this.output = out.data;
        }
      },
    },
  };
</script>
