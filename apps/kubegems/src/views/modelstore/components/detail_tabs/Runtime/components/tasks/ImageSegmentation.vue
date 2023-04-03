<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">{{ $t('tip.img') }}</div>

        <div :style="{ height: '800px' }">
          <BaseImagePreview v-model="obj.file" :preview-height="780" />
        </div>
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

      <v-col class="pl-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">{{ $t('tip.segmentation') }}</div>
        <v-row v-if="rawOut.length > 0">
          <v-col v-for="(item, index) in rawOut" :key="index" cols="4">
            <div class="text-body-1"> {{ item.label }} </div>
            <div class="text-body-1"> {{ item.score }} </div>
            <div v-if="item.box" class="text-body-1"> {{ item.box }} </div>
            <v-img v-if="item.mask" :src="`${item.mask}`" />
          </v-col>
        </v-row>
        <div v-else class="file__div">
          <div class="kubegems__full-center">
            <div class="text-subtitle-1">{{ $root.$t('data.no_data') }}</div>
          </div>
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
    name: 'ImageSegmentation',
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
    data: () => {
      return {
        obj: {
          file: null,
        },
        rawOut: [],
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
            this.rawOut = [];
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async submitContent() {
        if (!this.obj.file) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.upload_img_tip'),
            color: 'warning',
          });
          return;
        }
        const _v = this;
        const reader = new FileReader();
        reader.onloadend = async function () {
          const b64data = reader.result.split(',')[1];
          let name = '';
          if (_v.currentTask === 'object-detection') {
            name = 'inputs';
          } else {
            name = 'images';
          }
          const data = _v.composeInputs(_v.imageParam(name, b64data));
          const ret = await _v.infer(data);
          _v.rawOut = _v.parseResult(ret)[0];
        };
        reader.readAsDataURL(_v.obj.file);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .file {
    &__div {
      width: 100%;
      height: 800px;
      border: 1.5px solid #efefef;
      border-radius: 3px;
      position: relative;
    }
  }
</style>
