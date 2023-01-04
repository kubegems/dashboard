<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1">语音</div>
        <v-file-input accept="*/*" counter filled flat label="语音文件" show-size solo @change="onFileChange" />
      </v-col>

      <v-btn class="kubegems__full-center" color="primary" icon :loading="Circular" x-large @click="submitContent">
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6">
        <div class="text-subtitle-1">语音信息</div>
        <pre>{{ rawOut }}</pre>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import ParamsMixin from '../../mixins/params';

  export default {
    name: 'FineInputs',
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
            text: '请先上传音频文件',
            color: 'warning',
          });
          return;
        }
        const _v = this;
        const reader = new FileReader();
        reader.onloadend = async function () {
          const b64data = reader.result.split(',')[1];
          const data = _v.composeInputs(_v.audioParam('inputs', b64data));
          let ret = _v.infer(data);
          _v.rawOut = _v.parseResult(ret);
        };
        reader.readAsDataURL(this.obj.file);
      },
    },
  };
</script>
