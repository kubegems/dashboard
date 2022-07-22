<template>
  <v-card flat>
    <v-card-text class="pa-7">
      <div class="d-flex justify-center my-3">
        <div class="text-center" :style="{ wordBreak: 'break-all' }">
          <BaseLogo icon-name="ai-model" large :width="100" />
          <h3 class="text-h6 font-weight-medium primary--text">
            {{ $route.params.name }}
          </h3>
          <VersionSelect v-if="!noVersion" :versions="item ? item.versions : []" />
        </div>
      </div>
      <v-divider />
      <div class="py-5">
        <div>
          <div class="float-left model__rate">
            <h5 class="text-subtitle-1 kubegems__text">用户评分</h5>
            <h6 class="text-body-2 mb-3 model__rate__div">
              <div class="float-left model__rate__div__fraction mr-3">
                {{ item && item.rating ? item.rating.rating.toFixed(1) : 0 }}
              </div>
              <div class="float-left">
                <v-rating
                  background-color="orange lighten-3"
                  class="model__rate__div__star"
                  color="orange"
                  dense
                  half-increments
                  readonly
                  small
                  :value="item && item.rating ? item.rating.rating : 0"
                />
                <div class="text-caption"> {{ item && item.rating ? item.rating.count : 0 }}评价 </div>
              </div>
              <div class="kubegems__clear-float" />
            </h6>
          </div>
          <div class="float-left model__rate">
            <h5 class="text-subtitle-1 kubegems__text">平台推荐</h5>
            <h6 class="text-body-2 mb-2">
              <div class="float-left model__rate__div__recommend mr-3 ml-5">
                {{ item ? item.recomment : 0 }}
                <v-btn v-if="Admin" color="orange" icon @click="recommend">
                  <v-icon small>mdi-circle-edit-outline</v-icon>
                </v-btn>
              </div>
            </h6>
          </div>
          <div class="kubegems__clear-float" />
        </div>
        <h5 v-if="item && item.tags.length > 0" class="text-subtitle-1 kubegems__text">Tag</h5>
        <h6 class="text-body-2 mb-3">
          <v-chip v-for="(tag, index) in item ? item.tags : []" :key="index" class="ma-1" small>
            <v-avatar v-if="hasLogo(tag)" left>
              <BaseLogo class="model__logo" default-logo="tag" :icon-name="tag" :ml="0" :width="18" />
            </v-avatar>
            {{ tag }}
          </v-chip>
        </h6>
        <h5 class="text-subtitle-1 kubegems__text">类型</h5>
        <h6 class="text-body-2 mb-3">
          {{ item ? item.source : '' }}
        </h6>
        <h5 class="text-subtitle-1 kubegems__text">库</h5>
        <h6 class="text-body-2 mb-3">
          {{ item ? item.framework : '' }}
        </h6>
        <h5 class="text-subtitle-1 kubegems__text">协议</h5>
        <h6 class="text-body-2 mb-3">
          {{ item ? item.license : '' }}
        </h6>
        <h5 class="text-subtitle-1 kubegems__text">发布状态</h5>
        <h6 class="text-body-2 mb-3"> <v-icon color="success" left small>mdi-check-circle</v-icon>已发布 </h6>
      </div>
    </v-card-text>

    <Recommend ref="recommend" @refresh="refresh" />
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import Recommend from './Recommend';
  import VersionSelect from './VersionSelect';

  export default {
    name: 'ModelInfo',
    components: {
      Recommend,
      VersionSelect,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      noVersion: {
        type: Boolean,
        default: () => false,
      },
    },
    computed: {
      ...mapState(['Admin']),
    },
    methods: {
      hasLogo(tag) {
        return this.$MODEL_FRAMEWORK.some((i) => {
          return tag.toLowerCase().indexOf(i) > -1;
        });
      },
      recommend() {
        this.$refs.recommend.init(this.item);
        this.$refs.recommend.open();
      },
      refresh() {
        this.$emit('refresh');
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

    &__logo {
      margin-top: 2px;
    }
  }
</style>
