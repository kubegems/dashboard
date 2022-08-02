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
  <BaseDialog v-model="dialog" icon="mdi-account-edit" title="用户系统角色" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="用户角色" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.Username"
              class="my-0"
              label="用户"
              readonly
              required
              :rules="objRules.userIDRules"
            />
            <v-autocomplete
              v-model="obj.SystemRoleID"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_systemRoleItems"
              label="角色"
              no-data-text="暂无可选数据"
              :rules="objRules.systemRoleRules"
              @focus="onSystemRoleSelectFocus"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="changeUserRole"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { putChangeUserRole } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { required } from '@/utils/rules';

  export default {
    name: 'UpdateRole',
    mixins: [BaseSelect],
    data: () => ({
      dialog: false,
      valid: false,
      obj: {
        UserID: 0,
        Username: '',
        SystemRoleID: 0,
      },
      objRules: {
        userIDRules: [required],
        systemRoleRules: [required],
      },
    }),
    computed: {
      ...mapState(['Circular']),
    },
    mounted() {
      this.m_select_systemRoleSelectData();
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async changeUserRole() {
        if (this.$refs.form.validate(true)) {
          await putChangeUserRole(this.obj.SystemRoleID, this.obj.UserID, this.obj);
          this.reset();
          this.$emit('refresh');
        }
      },
      init(item) {
        this.obj = {
          Username: item.Username,
          UserID: item.ID,
          SystemRoleID: item.SystemRoleID,
        };
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
      onSystemRoleSelectFocus() {
        this.m_select_systemRoleSelectData();
      },
    },
  };
</script>
