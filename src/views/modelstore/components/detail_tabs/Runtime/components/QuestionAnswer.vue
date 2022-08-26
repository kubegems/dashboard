<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-form>
          <v-row>
            <v-col cols="12" md="12">
              <v-file-input accept="image/*" counter filled label="选择上传图片" show-size @change="whenFileChange" />
            </v-col>
            <v-col cols="12" md="12">
              <v-img v-if="previewUrl" max-height="500" max-width="500" :src="previewUrl" />
            </v-col>
          </v-row>
          <v-row>
            <v-btn primary @click="submitContent"> 提交 </v-btn>
          </v-row>
        </v-form>
      </v-col>
      <v-divider vertical />
      <v-col cols="12" md="6">
        <span> 结果预览 </span>
        <div v-for="(el, index) in raw_out" :key="index">
          <span> {{ el.label }} </span>
          <span> {{ el.score }} </span>
          <span v-if="el.box"> {{ el.box }} </span>
          <v-img v-if="el.mask" max-height="500" max-width="500" :src="`data:image/jpeg;base64, ${el.mask}`" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import ParamsMixin from '../mixins/params';

  export default {
    name: 'QuestionAnswer',
    mixins: [ParamsMixin],
    data: () => {
      return {
        previewUrl: '',
        file: null,
        result_image: '',
        raw_out: [],
      };
    },
    methods: {
      whenFileChange(e) {
        if (e) {
          this.previewUrl = URL.createObjectURL(e);
          this.file = e;
          this.result_image = '';
          this.raw_out = [];
        } else {
          this.previewUrl = '';
          this.file = null;
          this.result_image = '';
          this.raw_out = [];
        }
      },
      async submitContent() {
        const that = this;
        const reader = new FileReader();
        reader.onloadend = async function () {
          const b64data = reader.result.split(',')[1];
          const data = that.composeInputs(that.imageParam('inputs', b64data));
          const ret = await infer(data);
          let tmps = [];
          for (const out of ret.data.outputs) {
            if (out.name == 'result_image') {
              that.result_image = `data:image/jpeg;base64, ${out.data[0]}`;
            } else {
              tmps = JSON.parse(out.data[0]);
            }
          }
          that.raw_out = tmps;
        };
        reader.readAsDataURL(this.file);
      },
    },
  };
</script>
