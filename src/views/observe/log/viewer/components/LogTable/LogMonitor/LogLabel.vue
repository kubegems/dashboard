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
  <div class="my-2 mx-5 text-body-2">
    <pre class="log-table__pre">{{ item ? item.stream : {} }}</pre>
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
  };
</script>
