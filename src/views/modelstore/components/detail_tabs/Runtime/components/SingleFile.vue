<template>
  <v-form class="pa-3">
    <v-file-input accept="*/*" counter label="选择上传音频" show-size @change="whenFileChange" />
    <v-row>
      <v-col cols="12" md="12">
        <v-file-input accept="*/*" counter label="选择上传音频" show-size @change="whenFileChange" />
      </v-col>
      <v-col cols="12" md="12">
        <!-- v-img v-if="previewUrl" max-height="500" max-width="500" :src="previewUrl" /-->
      </v-col>
    </v-row>
    <v-row>
      <v-btn primary @click="submitContent"> 提交 </v-btn>
    </v-row>
  </v-form>
</template>

<script>
  import ParamsMixin from '../mixins/params';

  export default {
    name: 'SingleFile',
    mixins: [ParamsMixin],
    data: () => {
      return {
        // previewUrl: '',
        file: null,
        result_image: '',
        raw_out: null,
      };
    },
    methods: {
      whenFileChange(e) {
        if (e) {
          // this.previewUrl = URL.createObjectURL(e)
          this.file = e;
          this.result_image = '';
          this.raw_out = null;
        } else {
          // this.previewUrl = ''
          this.file = null;
          this.result_image = '';
          this.raw_out = null;
        }
      },
      async submitContent() {
        const that = this;
        const reader = new FileReader();
        reader.onloadend = async function () {
          const b64data = reader.result.split(',')[1];
          const data = that.composeInputs(that.audioParam('inputs', b64data));
          const ret = await infer(data);
          const tmp = [];
          for (const out of ret.data.outputs) {
            if (out.name == 'result_image') {
              that.result_image = `data:image/jpeg;base64, ${out.data[0]}`;
            } else {
              tmp.push(out);
            }
          }
          that.raw_out = tmp;
        };
        reader.readAsDataURL(this.file);
      },
    },
  };
</script>
