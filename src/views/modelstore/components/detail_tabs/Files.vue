<template>
  <div class="mt-3 white rounded pa-4">
    <div class="file">
      <div class="float-left"> 2022-04-23 12:12:12 CST </div>
      <div class="float-left file__size">11 KiB</div>
      <div class="float-left">80c421c23a95c9a4ccdfd3a32dfe10619dce5d72</div>
      <div class="kubegems__clear-float" />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Files',
    data: function () {
      return {
        // files: [],
      };
    },
  };
</script>

<style lang="scss" scoped>
  .file {
    line-height: 24px;
    font-size: 14px;

    &__size {
      width: 120px;
      text-align: center;
    }
  }
</style>
