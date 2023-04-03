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
  <div class="my-0 mx-3 text-body-2">
    <v-sheet v-for="(value, key) in item ? item.stream : {}" :key="key" class="ml-2">
      <v-chip class="my-1" color="success" small text-color="white">
        <v-icon left small> mdi-label </v-icon>
        <strong class="mx-1"> {{ key }} </strong>
        {{ value }}
      </v-chip>
      <div class="kubegems__clear-float" />
    </v-sheet>
  </div>
</template>

<script>
  export default {
    name: 'LogLabel',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    methods: {
      dispose() {
        return;
      },
    },
  };
</script>
