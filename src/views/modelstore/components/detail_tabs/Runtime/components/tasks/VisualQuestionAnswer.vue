<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">图片</div>

        <v-img v-if="previewUrl" max-width="800" :src="previewUrl" />
        <div v-else class="file__div">
          <div class="kubegems__full-center">
            <v-file-input
              accept="image/*"
              class="ml-5"
              counter
              filled
              flat
              hide-input
              prepend-icon="mdi-file-image"
              show-size
              solo
              @change="onFileChange"
            />
            <div class="text-subtitle-1">上传图片</div>
          </div>
        </div>

        <div class="text-subtitle-1 mb-3">问答</div>
        <v-text-field v-model="question" flat hide-details solo />
      </v-col>

      <v-btn class="kubegems__full-center" color="primary" icon x-large @click="submitContent">
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">问答结果</div>
        <pre>{{ rawOut }}</pre>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import ParamsMixin from '../../mixins/params';
  import { postModelApi } from '@/api';

  export default {
    name: 'VisualQuestionAnswer',
    mixins: [ParamsMixin],
    props: {
      instance: {
        type: Object,
        default: () => null,
      },
    },
    data: () => {
      return {
        previewUrl: '',
        file: null,
        question: '',
        rawOut: null,
      };
    },
    methods: {
      onFileChange(e) {
        if (e) {
          this.previewUrl = URL.createObjectURL(e);
          this.file = e;
        } else {
          this.previewUrl = '';
          this.file = null;
        }
        this.rawOut = null;
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
          const ret = await postModelApi(this.instance.environment, this.instance.name, data);
          that.rawOut = ret.data.outputs;
        };
        reader.readAsDataURL(this.file);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .file {
    &__div {
      width: 100%;
      height: 600px;
      border: 2px solid #efefef;
      border-radius: 3px;
      position: relative;
    }
  }
</style>
