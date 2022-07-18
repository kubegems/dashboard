<template>
  <span>
    <span v-if="getIconName(iconName, defaultLogo) === ''" />
    <Icon
      v-else-if="
        getIconName(iconName, defaultLogo) !== 'undefined' && getIconName(iconName, defaultLogo).indexOf('img:') === -1
      "
      :class="`ml-${ml}`"
      :height="`${width}px`"
      :icon="getIconName(iconName, defaultLogo)"
      :width="`${width}px`"
    />
    <img
      v-else
      :class="`${large ? 'logo__largeimg' : 'logo__img'} ml-${ml}`"
      :src="`/icon/${getIconName(iconName, defaultLogo).replaceAll('img:', '')}`"
      :style="`width: ${width}px;height: ${width}px;`"
    />
  </span>
</template>

<script>
  import { getIconName } from '@/utils/icon';

  export default {
    name: 'BaseLogo',
    props: {
      defaultLogo: {
        type: String,
        default: () => '',
      },
      iconName: {
        type: String,
        default: () => '',
      },
      large: {
        type: Boolean,
        default: () => false,
      },
      ml: {
        type: Number,
        default: () => 2,
      },
      width: {
        type: Number,
        default: () => 20,
      },
    },
    methods: {
      getIconName: getIconName,
    },
  };
</script>

<style lang="scss" scoped>
  .logo__img {
    width: 60px;
    height: 60px;
  }
  .logo__largeimg {
    width: 100px;
    height: 100px;
  }
</style>
