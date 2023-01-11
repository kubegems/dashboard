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

      <v-col class="pl-8" cols="12" md="6" :style="{ position: 'relative' }">
        <div class="text-subtitle-1 mb-3">{{ $t('tip.image_classily') }}</div>
        <v-img v-if="resultImage" max-height="500" :src="resultImage" />
        <div v-else class="file__div" :style="{ height: '500px' }">
          <div class="kubegems__full-center">
            <div class="text-subtitle-1">{{ $t('tip.image_preview') }}</div>
          </div>
        </div>
        <div class="text-subtitle-1 mb-3">{{ $t('tip.image_info') }}</div>
        <pre>{{ rawOut }}</pre>
        <div v-if="!rawOut" class="kubegems__full-center text-subtitle-1" :style="{ marginTop: '280px' }">
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
    name: 'SingleImage',
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
    data: () => {
      return {
        obj: {
          file: null,
        },
        resultImage: '',
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
            this.resultImage = '';
            this.rawOut = null;
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
          const data = _v.composeInputs(_v.imageParam('images', b64data));
          const ret = _v.infer(data);
          _v.rawOut = _v.parseResult(ret);
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
