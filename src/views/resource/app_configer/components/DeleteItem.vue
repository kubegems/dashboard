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
  <v-row justify="center">
    <v-dialog v-model="show" max-width="800" persistent>
      <v-card>
        <v-card-title class="text-h5 error--text"> 删除配置项 {{ item.key }} </v-card-title>
        <v-divider />
        <v-card-text class="text-subtitle-1 kubegems__text pt-3">
          确认删除 租户「{{ item.tenant }}」/项目「{{ item.project }}」/环境「{{ item.environment }}」 下的配置项
          {{ item.key }} ?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary light-2" text @click="cancel"> 取消 </v-btn>
          <v-btn color="red darken-1" text @click="submit"> 确认 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
  export default {
    name: 'DeleteItem',
    props: {
      showDeleteDialog: {
        type: Boolean,
        default: false,
      },
      item: {
        type: Object,
        default: () => {
          return {
            tenant: '',
            project: '',
            environment: '',
          };
        },
      },
      idx: {
        type: Number,
        default: -1,
      },
    },
    data() {
      return {
        show: false,
      };
    },
    watch: {
      showDeleteDialog: {
        handler(val) {
          this.show = val;
        },
        immediate: true,
      },
    },
    methods: {
      cancel() {
        this.$emit('close');
      },
      submit() {
        this.$emit('delete', this.idx);
      },
    },
  };
</script>
