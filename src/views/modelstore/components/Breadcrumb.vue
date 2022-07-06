<template>
  <v-flex class="mb-3">
    <v-row class="ma-0 pa-0">
      <v-col class="pa-0" cols="1" sm="12">
        <v-card class="custom-shaodow pa-0" height="64">
          <v-card-text class="breadcrumb__flex">
            <div class="text-subtitle-2 kubegems__text font-weight-medium breadcrumb__font">
              <img height="32" :src="imgSrc" />
            </div>
            <v-icon v-if="tip !== undefined" class="breadcrumb__bg mr-1" right small> fas fa-question-circle </v-icon>
            <div v-if="tip !== undefined" class="text-overline breadcrumb__bg breadcrumb__tip font-weight-regular">
              {{ tip }}
            </div>
            <slot name="extend" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-flex>
</template>

<script>
  export default {
    name: 'Breadcrumb',
    props: {
      hub: {
        type: String,
        default: () => 'kubegems-hub',
      },
    },
    data() {
      return {
        imgSrc: '',
        tip: '',
      };
    },
    watch: {
      hub: {
        handler(newValue) {
          switch (newValue) {
            case 'huggingface':
              this.imgSrc = '/icon/hugging-face.png';
              this.tip = '全球大型开源社区,专注于NLP技术。';
              break;
            case 'openmmlab':
              this.imgSrc = '/icon/openmmlab.png';
              this.tip = '深度学习时代最完整的计算机视觉开源算法体系。';
              break;
            case 'tensorflow':
              this.imgSrc = '/icon/tensorflow.png';
              this.tip = '一个核心开源库，可以帮助您开发和训练机器学习模型。';
              break;
            case 'kubegems-charts':
              this.imgSrc = '/logo-about.svg';
              this.tip =
                '一个描述Kubernetes相关资源的文件集合，单个应用可以用来部署某些复杂的HTTP服务器以及web全栈应用、数据库、缓存等。';
              break;
            case 'bitnami':
              this.imgSrc = '/icon/bitnami.png';
              this.tip =
                '一个描述Kubernetes相关资源的文件集合，单个应用可以用来部署某些复杂的HTTP服务器以及web全栈应用、数据库、缓存等。';
              break;
            case 'chartmuseum':
              this.imgSrc = '/icon/chartmuseum.png';
              this.tip =
                '一个描述Kubernetes相关资源的文件集合，单个应用可以用来部署某些复杂的HTTP服务器以及web全栈应用、数据库、缓存等。';
              break;
            case 'pytorch':
              this.imgSrc = '/icon/pytorch.jpeg';
              this.tip = '发现模型并将其发布到专为研究探索而设计的预训练模型存储库。';
              break;
            default:
              this.imgSrc = '/logo-about.svg';
              this.tip = 'Kubegems内置模型商店。';
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
  .breadcrumb {
    &__flex {
      display: flex;
    }

    &__font {
      line-height: 1rem !important;

      @media (max-width: 1000px) {
        min-width: 75px;
      }
    }

    &__bg {
      color: rgba(0, 0, 0, 0.6);
      text-transform: capitalize !important;
    }

    &__tip {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (max-width: 1000px) {
        width: 600px;
      }
    }
  }
</style>
