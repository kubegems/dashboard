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
        <div class="v-card__text pa-2 text-caption">{{ content }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'BaseMarquee',
    props: {
      content: {
        type: String,
        default: '',
      },
      delay: {
        type: Number,
        default: 0.5,
      },
      speed: {
        type: Number,
        default: 100,
      },
    },
    data() {
      return {
        wrapWidth: 0,
        firstRound: true,
        duration: 0,
        offsetWidth: 0,
        animationClass: '',
      };
    },
    computed: {
      contentStyle() {
        return {
          paddingLeft: (this.firstRound ? 0 : this.wrapWidth) + 'px',
          animationDelay: (this.firstRound ? this.delay : 0) + 's',
          animationDuration: this.duration + 's',
        };
      },
    },
    watch: {
      content: {
        immediate: true,
        handler() {
          this.$nextTick(() => {
            const { wrap, content } = this.$refs;
            const wrapWidth = wrap.getBoundingClientRect().width;
            const offsetWidth = content.getBoundingClientRect().width;
            this.wrapWidth = wrapWidth;
            this.offsetWidth = offsetWidth;
            if (this.wrapWidth < this.offsetWidth) {
              this.duration = offsetWidth / this.speed;
              const percentage = (1 - wrapWidth / offsetWidth) * 100;
              content.animate([{ transform: `translate3d(-${percentage}%, 0, 0)` }], {
                duration: this.duration * 500,
                delay: 500,
                fill: 'forwards',
                easing: 'linear',
                iterations: Infinity,
                direction: 'alternate',
              });
            }
          });
        },
      },
    },
  };
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
