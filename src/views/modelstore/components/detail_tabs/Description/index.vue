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
  <div class="white rounded mt-3 pa-4" :style="{ height: `${height}px`, overflowY: 'auto' }">
    <Markdown v-if="content" :content="content" />
    <div v-else class="text-center text-body-2 mt-12 kubegems__text">{{ $root.$t('data.no_data') }}</div>
  </div>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { mapState } from 'vuex';

  import Markdown from './Markdown';
  import { getModelVersionContent } from '@/api';

  export default {
    name: 'Description',
    components: {
      Markdown,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        content: '',
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 214) / this.Scale);
      },
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue && newValue.v) {
            this.modelVersionContent();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async modelVersionContent() {
        const data = await getModelVersionContent(this.item.source, Base64.encode(this.item.name), this.item.v);
        this.content = data.intro || '';
      },
    },
  };
</script>
