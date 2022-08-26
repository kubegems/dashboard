<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-row>
          <v-col cols="12" md="12">
            <v-file-input accept="image/*" counter filled label="选择上传图片" show-size @change="whenFileChange" />
          </v-col>
          <v-col cols="12" md="12">
            <v-img v-if="previewUrl" max-height="500" max-width="500" :src="previewUrl" />
          </v-col>
        </v-row>
        <v-row>
          <v-text-field v-model="question" />
        </v-row>
        <v-row>
          <v-btn primary @click="submitContent"> 提交 </v-btn>
        </v-row>
      </v-col>
      <v-divider vertical />
      <v-col cols="12" md="6">
        <span> 结果预览 </span>
        <span> {{ raw_out }} </span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import ParamsMixin from '../mixins/params';

  export default {
    name: 'VisualQuestionAnswer',
    mixins: [ParamsMixin],
    data: () => {
      return {
        previewUrl: '',
        file: null,
        question: '',
        raw_out: null,
      };
    },
    methods: {
      whenFileChange(e) {
        if (e) {
          this.previewUrl = URL.createObjectURL(e);
          this.file = e;
          this.raw_out = null;
        } else {
          this.previewUrl = '';
          this.file = null;
          this.raw_out = null;
        }
      },
      async submitContent() {
        const that = this;
        const reader = new FileReader();
        reader.onloadend = async function () {
          const b64data = reader.result.split(',')[1];
          const data = this.composeInputs(
            this.imageParam('iamge', b64data),
            this.stringParam('question', that.question),
          );
          const ret = await infer(data);
          that.raw_out = ret.data.outputs;
        };
        reader.readAsDataURL(this.file);
      },
    },
  };
</script>
