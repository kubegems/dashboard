<template>
  <v-card flat>
    <v-card-text class="pa-7">
      <div class="d-flex justify-center my-3">
        <div class="text-center">
          <img class="my-4" :src="imgSrc" width="200" />
          <h3 class="mt-2 text-h6 font-weight-medium primary--text">
            {{ $route.params.name }}
          </h3>
          <VersionSelect />
        </div>
      </div>
      <v-divider />
      <div class="py-5">
        <div>
          <div class="float-left model__rate">
            <h5 class="text-subtitle-1 kubegems__text">用户评分</h5>
            <h6 class="text-body-2 mb-3 model__rate__div">
              <div class="float-left model__rate__div__fraction mr-3">3.5</div>
              <div class="float-left">
                <v-rating
                  background-color="orange lighten-3"
                  class="model__rate__div__star"
                  color="orange"
                  dense
                  readonly
                  small
                  :value="3.6"
                />
                <div class="text-caption">138评价</div>
              </div>
              <div class="kubegems__clear-float" />
            </h6>
          </div>
          <div class="float-left model__rate">
            <h5 class="text-subtitle-1 kubegems__text">平台推荐</h5>
            <h6 class="text-body-2 mb-2">
              <div class="float-left model__rate__div__recommend mr-3">67</div>
            </h6>
          </div>
          <div class="kubegems__clear-float" />
        </div>
        <h5 class="text-subtitle-1 kubegems__text">类型</h5>
        <h6 class="text-body-2 mb-3">{{ item ? item.config.model_type : '' }}</h6>
        <h5 class="text-subtitle-1 kubegems__text">库</h5>
        <h6 class="text-body-2 mb-3">{{ item ? item.library_name : '' }}</h6>
        <h5 class="text-subtitle-1 kubegems__text">协议</h5>
        <h6 class="text-body-2 mb-3" />
        <h5 class="text-subtitle-1 kubegems__text">发布状态</h5>
        <h6 class="text-body-2 mb-3"> <v-icon color="success" left small>mdi-check-circle</v-icon>已发布 </h6>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import VersionSelect from './VersionSelect';

  export default {
    name: 'ModelInfo',
    components: {
      VersionSelect,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        imgSrc: '',
      };
    },
    watch: {
      '$route.query.registry': {
        handler(newValue) {
          switch (newValue) {
            case 'huggingface':
              this.imgSrc = '/icon/hugging-face.png';
              break;
            case 'openmmlab':
              this.imgSrc = '/icon/openmmlab.png';
              break;
            case 'tensorflow':
              this.imgSrc = '/icon/tensorflow.png';
              break;
            case 'pytorch':
              this.imgSrc = '/icon/pytorch.jpeg';
              break;
            default:
              this.imgSrc = '/logo-about.svg';
              break;
          }
        },
        deep: true,
        immediate: true,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .model {
    &__rate {
      width: 50%;

      &__div {
        line-height: 40px;

        &__fraction {
          font-weight: bold;
          font-size: 20px;
        }

        &__recommend {
          font-weight: bold;
          font-size: 20px;
          line-height: 40px;
        }

        &__star {
          line-height: 20px;
        }
      }
    }
  }
</style>
