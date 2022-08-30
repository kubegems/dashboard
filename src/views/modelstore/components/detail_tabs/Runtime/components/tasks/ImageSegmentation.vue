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
      </v-col>

      <v-btn class="kubegems__full-center" color="primary" icon x-large @click="submitContent">
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">图片片段信息</div>
        <v-row v-if="rawOut.length > 0">
          <v-col v-for="(item, index) in rawOut" :key="index" cols="4">
            <div class="text-body-1"> {{ item.label }} </div>
            <div class="text-body-1"> {{ item.score }} </div>
            <div v-if="item.box" class="text-body-1"> {{ el.box }} </div>
            <v-img v-if="item.mask" :src="`data:image/jpeg;base64, ${item.mask}`" />
          </v-col>
        </v-row>
        <div v-else class="file__div">
          <div class="kubegems__full-center">
            <div class="text-subtitle-1">请先上传图片</div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import ParamsMixin from '../../mixins/params';
  import { postModelApi } from '@/api';

  export default {
    name: 'ImageSegmentation',
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
        rawOut: [],
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
        this.rawOut = [];
      },
      async submitContent() {
        const that = this;
        const reader = new FileReader();
        reader.onloadend = async function () {
          const b64data = reader.result.split(',')[1];
          const data = that.composeInputs(that.imageParam('inputs', b64data));
          const ret = await postModelApi(this.instance.environment, this.instance.name, data);
          let tmps = [];
          for (const out of ret.data.outputs) {
            if (out.name !== 'result_image') {
              tmps = JSON.parse(out.data[0]);
            }
          }
          that.rawOut = tmps;
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
      height: 800px;
      border: 2px solid #efefef;
      border-radius: 3px;
      position: relative;
    }
  }
</style>
