<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-container fluid>
    <v-card class="mt-8" height="400px">
      <v-row class="row-height">
        <v-col class="d-none d-md-flex align-center justify-center">
          <div class="d-none d-sm-block">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h4 primary--text font-weight-medium"> 您暂时不属于任何租户！ </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  您可以联系某个租户的管理员邀请您加入租户中或者创建新的租户
                </h6>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
  export default {
    name: 'WhitePage',
  };
</script>

<style lang="scss" scoped>
  .row-height {
    height: 400px;
  }
</style>
