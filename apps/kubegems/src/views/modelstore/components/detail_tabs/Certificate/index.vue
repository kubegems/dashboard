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
  <div class="mt-3 white rounded pa-4 certificate">
    <div class="license">
      License授权
      <v-icon color="success" right small>mdi-check-circle</v-icon>
      <span class="license__expired">有效期至 2022/12/22 12:12:12</span>
    </div>

    <v-flex class="kubegems__top-right mt-3">
      <v-menu left>
        <template #activator="{ on }">
          <v-btn icon>
            <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-text class="pa-2 text-center">
            <v-flex>
              <v-btn color="primary" small text> 编辑 </v-btn>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-flex>
  </div>
</template>

<script>
  export default {
    name: 'Certificate',
  };
</script>

<style lang="scss" scoped>
  .certificate {
    position: relative;
  }

  .license {
    line-height: 30px;

    &__expired {
      font-size: 13px;
    }
  }
</style>
