<template functional>
  <div class="subtitle font-weight-regular blue-grey--text text--darken-2">{{ props.title }}</div>
</template>

<style lang="scss" scoped>
.subtitle {
  position: relative;
  line-height: 28px;
  margin: 16px 0;

  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.12);
  }
}
</style>
