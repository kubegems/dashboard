<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <span>
    <span v-if="getIconName(iconName, defaultLogo) === ''" />
    <Icon
      v-else-if="
        getIconName(iconName, defaultLogo) !== 'undefined' && getIconName(iconName, defaultLogo).indexOf('img:') === -1
      "
      :class="`ml-${ml} mt-${mt}`"
      :height="`${width}px`"
      :icon="getIconName(iconName, defaultLogo)"
      :width="`${width}px`"
      :color="color"
      :style="{ marginTop: top ? `${top}px !important` : '' }"
    />
    <img
      v-else
      :class="`${large ? 'logo__largeimg' : 'logo__img'} ml-${ml} mt-${mt}`"
      :src="`/icon/${getIconName(iconName, defaultLogo).replaceAll('img:', '')}`"
      :style="{
        width: `${width}px`,
        height: `${width}px`,
        position: absolute ? 'absolute' : 'relative',
        marginTop: top ? `${top}px !important` : '',
      }"
    />
  </span>
</template>

<script lang="ts" setup>
  import { getIconName } from '@kubegems/extension/icon/helpers';

  withDefaults(
    defineProps<{
      defaultLogo?: string;
      iconName?: string;
      large?: boolean;
      ml?: number;
      mt?: number | string;
      absolute?: boolean;
      width?: number;
      color?: string;
      top?: number;
    }>(),
    {
      defaultLogo: '',
      iconName: '',
      large: false,
      ml: 2,
      mt: 0,
      absolute: false,
      width: 20,
      color: '',
      top: 0,
    },
  );
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
