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
  <v-card class="split-container" :class="{ 'split-container--hidden': !state.expand }" flat>
    <div class="split-container__side" :style="sideStyle">
      <div class="split-container__side-header">
        <div class="split-container__side-title">
          <slot name="title">{{ title }}</slot>
        </div>
        <v-btn v-if="state.expand" color="primary" :disabled="disabled" icon type="text" x-small @click="toggled">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>
      <slot name="side" />
    </div>

    <v-divider class="mx-4" vertical />

    <div class="split-container__main" :style="mainStyle">
      <slot />
    </div>

    <!-- 收起时标签 -->
    <transition name="slide-x-transition">
      <div v-if="!state.expand" class="split-container__fiexd">
        <!-- label -->
        <span class="split-container__fiexd-label">
          <slot name="label">{{ title }}</slot>
        </span>

        <!-- tooltip -->
        <v-menu
          v-if="tooltip"
          :close-delay="200"
          :close-on-content-click="false"
          nudge-right="24px"
          open-on-hover
          right
        >
          <template #activator="{ on }">
            <v-btn color="white" icon x-small v-on="on">
              <v-icon>mdi-tooltip-text-outline</v-icon>
            </v-btn>
          </template>
          <v-card class="pa-0" flat>
            <slot name="tooltip" />
          </v-card>
        </v-menu>

        <!-- 展开按钮 -->
        <v-btn color="white" :disabled="disabled" icon x-small @click="toggled">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>
    </transition>
    <!-- 收起时标签 -->
  </v-card>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, reactive, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      disabled?: boolean;
      sideWidth?: string;
      title?: string;
      tooltip?: boolean;
    }>(),
    {
      disabled: false,
      sideWidth: '300px',
      title: undefined,
      tooltip: false,
    },
  );

  const state = reactive({
    expand: true,
  });

  const toggled = (): void => {
    setExpand(!state.expand);
  };

  const manualResize = () => {
    const event = new Event('resize', {
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  };

  const setExpand = (value: boolean) => {
    state.expand = value;
  };

  const sideStyle: ComputedRef<{ [key: string]: any }> = computed(() => {
    return {
      width: props.sideWidth || '300px',
    };
  });
  const mainStyle: ComputedRef<{ [key: string]: any }> = computed(() => {
    return {
      width: state.expand ? `calc(100% - 33px - ${props.sideWidth})` : 'calc(100% - 33px)',
    };
  });

  watch(
    () => state.expand,
    async (newValue) => {
      if (!newValue) return;
      manualResize();
    },
    { deep: true },
  );
</script>

<style lang="scss" scoped>
  .split-container {
    min-height: 100px;
    position: relative;
    display: flex;
    width: 100%;
    padding: 16px;

    &__side,
    &__main {
      position: relative;
      transition: width 0.5s ease;
    }

    &__side {
      width: 300px;

      &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 48px;
        line-height: 46px;
        border-bottom: 2px solid $primary;
        margin-bottom: 12px;
        overflow: hidden;
      }

      &-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: $primary;
      }
    }

    &__fiexd {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 24px;
      padding: 8px 2px;
      border-radius: 4px;
      background-color: $primary;
      font-size: 14px;
      text-align: center;
      line-height: 24px;
      letter-spacing: 4px;
      color: #ffffff;

      &-label {
        position: relative;
        left: -2.5px;
        writing-mode: tb-rl;
      }
    }

    &--hidden {
      .split-container__side {
        width: 0 !important;
        white-space: nowrap;
        overflow: hidden;
      }
    }
  }
</style>
