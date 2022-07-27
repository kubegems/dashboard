<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "Licens");
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
    <Markdown :content="content" />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import Markdown from './Markdown';

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
          if (newValue) {
            this.content = newValue?.intro || '';
          }
        },
        deep: true,
        immediate: true,
      },
    },
  };
</script>
