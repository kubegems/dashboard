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
  <v-menu :close-delay="200" nudge-left="8px" nudge-top="25px" open-on-hover top :value="showTootip">
    <template #activator="{ on, attrs }">
      <div ref="span" class="log-ellipsis-text" @mouseenter="handleShowTootip" @mouseleave="handleCloseTootip">
        {{ text }}
      </div>
      <span v-bind="attrs" v-on="on" />
    </template>
    <v-card>
      <v-card-text class="pa-2"> {{ text }} </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  export default {
    name: 'EllipsisText',
    props: {
      text: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        showTootip: false,
        hiddenSpan: null,
      };
    },
    methods: {
      handleShowTootip() {
        this.hiddenSpan = document.createElement('span');
        this.hiddenSpan.innerHTML = this.text;
        this.hiddenSpan.style.position = 'absolute';
        this.hiddenSpan.style.opacity = '0';
        this.hiddenSpan.style.left = '0';
        this.hiddenSpan.style.top = '0';
        this.$refs.span.appendChild(this.hiddenSpan);
        this.$nextTick(() => {
          this.showTootip = this.hiddenSpan.offsetWidth > this.$refs.span.offsetWidth;
          this.$refs.span?.removeChild(this.hiddenSpan);
          this.hiddenSpan = null;
        });
      },
      handleCloseTootip() {
        this.showTootip = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .log-ellipsis-text {
    position: relative;
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
