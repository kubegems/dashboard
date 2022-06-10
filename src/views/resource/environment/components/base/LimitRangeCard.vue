<template>
  <v-flex class="mx-2">
    <v-sheet class="pa-1">
      <v-flex class="float-left">
        <v-flex class="float-left text-body-2 py-2 kubegems__min-width">
          <span>容器CPU</span>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.default.cpu : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> 默认值 </v-flex>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.defaultRequest.cpu : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> 默认请求值 </v-flex>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.max.cpu : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> 限制值 </v-flex>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>

    <v-sheet class="pa-1">
      <v-flex class="float-left">
        <v-flex class="float-left text-body-2 py-2 kubegems__min-width">
          <span>容器内存</span>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.default.memory : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> 默认值 </v-flex>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.defaultRequest.memory : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> 默认请求值 </v-flex>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Container.max.memory : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> 限制值 </v-flex>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>

    <v-sheet class="pa-1">
      <v-flex class="float-left">
        <v-flex class="float-left text-body-2 py-2 kubegems__min-width">
          <span>容器组CPU</span>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Pod.max.cpu : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> 限制值 </v-flex>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>

    <v-sheet class="pa-1">
      <v-flex class="float-left">
        <v-flex class="float-left text-body-2 py-2 kubegems__min-width">
          <span>容器组内存</span>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.Pod.max.memory : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> 限制值 </v-flex>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center" />
          <v-flex class="text-center py-0" />
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>

    <v-sheet class="pa-1">
      <v-flex class="float-left">
        <v-flex class="float-left text-body-2 py-2 kubegems__min-width">
          <span>存储卷容量</span>
        </v-flex>
        <v-flex class="float-left limit-range-min-width">
          <v-flex class="text-body-2 text-center">
            {{ obj ? obj.LimitRange.PersistentVolumeClaim.max.storage : 0 }}
          </v-flex>
          <v-flex class="text-center py-0"> 限制值 </v-flex>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
  </v-flex>
</template>

<script>
  export default {
    name: 'LimitRangeCard',
    props: {
      obj: {
        type: Object,
        default: () => null,
      },
    },
  };
</script>

<style>
  .limit-range-min-width {
    width: 120px;
  }
</style>
