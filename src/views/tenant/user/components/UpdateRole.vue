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
  <BaseDialog v-model="dialog" icon="mdi-account-edit" :title="$t('tip.role_title')" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.role')])" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.Username"
              class="my-0"
              :label="$root.$t('resource.account')"
              readonly
              required
              :rules="objRules.userIDRules"
            />
            <v-autocomplete
              v-model="obj.SystemRoleID"
              class="my-0"
              color="primary"
              hide-selected
              :items="systemRoleItems"
              :label="$root.$t('resource.role')"
              :no-data-text="$root.$t('data.no_data')"
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
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="changeUserRole">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { putChangeUserRole, systemRoleSelectData } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { required } from '@/utils/rules';

  export default {
    name: 'UpdateRole',
    i18n: {
      messages: messages,
    },
    mixins: [BaseSelect],
    data: () => ({
      dialog: false,
      valid: false,
      systemRoleItems: [],
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
      this.systemRoleSelectData();
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
        this.systemRoleSelectData();
      },
      async systemRoleSelectData() {
        const data = await systemRoleSelectData({ noprocessing: true });
        const systemRoleSelect = [];
        data.List.forEach((role) => {
          systemRoleSelect.push({
            text:
              role.RoleCode === 'sysadmin'
                ? this.$root.$t('role.system.administrator')
                : this.$root.$t('role.system.normal'),
            value: role.ID,
          });
        });
        this.systemRoleItems = systemRoleSelect;
      },
    },
  };
</script>
