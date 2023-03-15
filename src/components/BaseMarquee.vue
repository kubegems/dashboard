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
  <div class="marquee">
    <div ref="wrap" class="wrap">
      <div ref="content" class="content" :class="animationClass" :style="contentStyle">
        <slot />
      </div>
    </div>
    <div class="v-menu__content theme--light manuable__content__active">
      <div class="v-card v-sheet theme--light text-center">
        <div class="v-card__text pa-2 text-caption">{{ displayContent }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, nextTick, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      displayContent?: string;
      delay?: number;
      speed?: number;
    }>(),
    {
      displayContent: '',
      delay: 0.5,
      speed: 100,
    },
  );

  const wrapWidth = ref<number>(0);
  const firstRound = ref<boolean>(true);
  const duration = ref<number>(0);
  const offsetWidth = ref<number>(0);
  const animationClass = ref<string>('');

  const contentStyle: ComputedRef<any> = computed(() => {
    return {
      paddingLeft: (firstRound.value ? 0 : wrapWidth.value) + 'px',
      animationDelay: (firstRound.value ? props.delay : 0) + 's',
      animationDuration: duration.value + 's',
    };
  });

  const wrap = ref(null);
  const content = ref(null);
  watch(
    () => props.displayContent,
    async (newValue) => {
      if (!newValue) return;
      nextTick(() => {
        const wrapW = wrap.value.getBoundingClientRect().width;
        const offsetW = content.value.getBoundingClientRect().width;
        wrapWidth.value = wrapW;
        offsetWidth.value = offsetW;
        if (wrapWidth.value < offsetWidth.value) {
          duration.value = offsetWidth.value / props.speed;
          const percentage = (1 - wrapW / offsetW) * 100;
          content.value.animate([{ transform: `translate3d(-${percentage}%, 0, 0)` }], {
            duration: duration.value * 500,
            delay: 500,
            fill: 'forwards',
            easing: 'linear',
            iterations: Infinity,
            direction: 'alternate',
          });
        }
      });
    },
    { immediate: true },
  );
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .wrap {
    width: 100%;
    height: 30px;
    line-height: 30px;
    overflow: hidden;
    position: relative;
    background: none;
    padding: 0;
    color: black;
  }

  .wrap .content {
    position: absolute;
    white-space: nowrap;
    cursor: pointer;
  }

  .manuable__content__active {
    z-index: 9;
    top: -4px;
    left: 70px;
    max-width: 400px;
    width: max-content;
    white-space: nowrap;
    display: none;
  }

  .marquee {
    position: relative;
  }

  .marquee:hover div {
    display: block;
  }
</style>
