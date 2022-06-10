<template>
  <span>
    <Icon
      v-if="getIconName(iconName) !== 'undefined' && getIconName(iconName).indexOf('img:') === -1"
      :class="`ml-${ml}`"
      :icon="getIconName(iconName)"
      :width="`${width}px`"
      :height="`${width}px`"
    />
    <img
      v-else
      :class="`${large ? 'logo__largeimg' : 'logo__img'} ml-${ml}`"
      :style="`width: ${width}px;height: ${width}px;`"
      :src="`/icon/${getIconName(iconName).replaceAll('img:', '')}`"
    />
  </span>
</template>

<script>
  import { getIconName } from '@/utils/icon';

  export default {
    name: 'BaseLogo',
    props: {
      iconName: {
        type: String,
        default: () => '',
      },
      width: {
        type: Number,
        default: () => 20,
      },
      large: {
        type: Boolean,
        default: () => false,
      },
      ml: {
        type: Number,
        default: () => 2,
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
