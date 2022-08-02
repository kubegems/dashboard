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
  <BaseDialog v-model="visible" icon="mdi-content-save" title="保存快照" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="快照定义" />
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-text-field v-model="snapshotName" label="快照名称" :rules="objRules.SnapshotNameRules" />
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="handleSaveSnapshot"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { postAddLogQuerySnapshot } from '@/api';

  export default {
    name: 'LogSaveSnapshot',
    data: () => ({
      visible: false,
      valid: false,
      snapshotName: '',
      objRules: {
        SnapshotNameRules: [(v) => !!v || '名称必填'],
      },
    }),
    computed: {
      ...mapState(['Circular', 'Progress', 'User']),
      ...mapGetters(['Cluster']),
    },
    methods: {
      show(params) {
        if (this.Progress) return;
        this.visible = true;
        this.params = params;
      },
      async handleSaveSnapshot() {
        if (this.Progress) return;
        if (this.$refs.form.validate()) {
          await postAddLogQuerySnapshot({
            ...this.params,
            SnapshotName: this.snapshotName,
            CreateAt: new Date(),
            CreatorID: this.User.ID,
          });
        }
        this.reset();
      },
      reset() {
        this.visible = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
