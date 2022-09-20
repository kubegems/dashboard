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
  <div class="ma-3">
    <v-tabs v-model="tab" height="30" rounded-t>
      <v-tab v-for="item in tabItems" :key="item.value">
        {{ item.text }}
      </v-tab>
    </v-tabs>
    <div class="mt-3">
      <component :is="tabItems[tab].value" :ref="tabItems[tab].value" :item="item" />
    </div>
  </div>
</template>

<script>
  import SchemaForm from './SchemaForm';
  import ValuesForm from './ValuesForm';

  export default {
    name: 'SchemaRender',
    components: {
      SchemaForm,
      ValuesForm,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        tab: 0,
        tabItems: [
          { text: 'Schema', value: 'SchemaForm' },
          { text: 'Helm Values', value: 'ValuesForm' },
        ],
      };
    },
    methods: {
      validate() {
        if (this.$refs[this.tabItems[this.tab].value]) {
          return this.$refs[this.tabItems[this.tab].value].validate();
        }
      },
      getData() {
        if (this.$refs[this.tabItems[this.tab].value]) {
          return this.$refs[this.tabItems[this.tab].value].getData();
        }
      },
    },
  };
</script>
