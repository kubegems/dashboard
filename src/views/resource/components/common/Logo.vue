<template>
  <span>
    <Icon
      v-if="
        getIconName(iconName) !== 'undefined' &&
          getIconName(iconName).indexOf('img:') === -1
      "
      class="ml-2"
      :icon="getIconName(iconName)"
      :width="`${width}px`"
      :height="`${width}px`"
    />
    <img
      v-else
      :class="`${large ? 'largeimg' : 'img'}`"
      :style="`width: ${width}px;height: ${width}px;`"
      :src="`/icon/${getIconName(iconName).replaceAll('img:', '')}`"
    />
  </span>
</template>

<script>
import { getIconName } from '@/utils/icon'

export default {
  name: 'Logo',
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
  },
  methods: {
    getIconName: getIconName,
  },
}
</script>

<style lang="scss" scoped>
.img {
  width: 60px;
  height: 60px;
  margin-left: 8px;
}
.largeimg {
  width: 100px;
  height: 100px;
  margin-left: 8px;
}
</style>
