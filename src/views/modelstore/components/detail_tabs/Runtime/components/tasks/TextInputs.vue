<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">文本输入</div>
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

      <v-col class="pl-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">文本输出</div>
        <pre style="word-wrap: break-word">{{ output }}</pre>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import ParamsMixin from '../../mixins/params';

  export default {
    name: 'TextInputs',
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
          console.log(content);
          return content.indexOf('<mask>') !== -1;
        } else {
          return true;
        }
      },
      async submitContent() {
        if (!this.validInput(this.obj.textContent)) {
          this.$store.commit('SET_SNACKBAR', {
            text: '输入的内容请包含内容 "<mask>"',
            color: 'warning',
          });
          return;
        }
        if (!this.obj.textContent.trim()) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请输入文本',
            color: 'warning',
          });
          return;
        }
        const data = this.composeInputs(this.stringArrayParam('args', this.obj.textContent));
        const ret = this.infer(data);
        this.output = this.parseResult(ret);
      },
    },
  };
</script>
