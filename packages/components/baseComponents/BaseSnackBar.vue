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
  <v-snackbar
    v-model="store.state.SnackBar.value"
    class="mr-1"
    :color="store.state.SnackBar.color"
    right
    text
    top
    transition="slide-x-reverse-transition"
  >
    <v-flex>
      <v-flex class="float-left">
        <v-icon :color="store.state.SnackBar.color" left small>
          {{ store.state.SnackBar.icon }}
        </v-icon>
      </v-flex>
      <v-flex
        :class="`float-left snackbar-break ${store.state.SnackBar.collapse ? 'snackbar--collapse' : 'snackbar--show'}`"
      >
        {{ store.state.SnackBar.text }}
      </v-flex>
      <div class="kubegems__clear-float" />
      <v-btn
        v-if="store.state.SnackBar.text && store.state.SnackBar.text.length > 300"
        :color="store.state.SnackBar.color"
        icon
        small
        @click="store.state.SnackBar.collapse = !store.state.SnackBar.collapse"
      >
        <v-icon small>
          {{ store.state.SnackBar.collapse ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
        </v-icon>
      </v-btn>
    </v-flex>
    <template #action>
      <v-icon :color="store.state.SnackBar.color" left small @click="store.state.SnackBar.value = false">
        mdi-close
      </v-icon>
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';

  const store = useStore();
</script>

<style lang="scss" scoped>
  .snackbar-break {
    word-break: break-word;
  }
  .snackbar--collapse {
    max-height: 60px;
    overflow: hidden;
    width: 90%;
  }
  .snackbar--show {
    /* eslint-disable unit-whitelist */
    max-height: 96vh;
    overflow-y: auto;
    width: 95%;
  }
</style>
