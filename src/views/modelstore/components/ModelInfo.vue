<template>
  <v-card flat>
    <v-card-text class="pa-7">
      <div class="d-flex justify-center my-3">
        <div class="text-center">
          <BaseLogo icon-name="$route.params.name" large :width="100" />
          <h3 class="mt-2 text-h6 font-weight-medium primary--text">
            {{ $route.params.name }}
          </h3>
          <VersionSelect />
        </div>
      </div>
      <v-divider />
      <div class="py-5">
        <h5 class="text-subtitle-1 kubegems__text">用户评分</h5>
        <h6 class="text-body-2 mb-3">
          <v-rating background-color="orange lighten-3" color="orange" small />
        </h6>
        <h5 class="text-subtitle-1 kubegems__text">平台推荐</h5>
        <h6 class="text-body-2 mb-2" />
        <h5 class="text-subtitle-1 kubegems__text">类型</h5>
        <h6 class="text-body-2 mb-3" />
        <h5 class="text-subtitle-1 kubegems__text">库</h5>
        <h6 class="text-body-2 mb-3" />
        <h5 class="text-subtitle-1 kubegems__text">协议</h5>
        <h6 class="text-body-2 mb-3" />
        <h5 class="text-subtitle-1 kubegems__text">发布状态</h5>
        <h6 class="text-body-2 mb-3" />
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
    data() {
      return {};
    },
  };
</script>
