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
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-account-edit"
    :title="i18nLocal.t('tip.role_title')"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.role')])" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.Username"
              class="my-0"
              :label="i18n.t('resource.account')"
              readonly
              required
              :rules="objRule.userId"
            />
            <v-autocomplete
              v-model="obj.SystemRoleID"
              class="my-0"
              color="primary"
              hide-selected
              :items="systemRoleItems"
              :label="i18n.t('resource.role')"
              :no-data-text="i18n.t('data.no_data')"
              :rules="objRule.systemRole"
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
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="changeUserRole">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { nextTick, onMounted, reactive, ref } from 'vue';

  import { useI18n } from '../i18n';
  import { useRoleList } from '@/composition/role';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { Role } from '@/types/role';
  import { User } from '@/types/user';
  import { required } from '@/utils/rules';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
  });

  const open = (): void => {
    state.dialog = true;
  };

  const init = (item: User): void => {
    obj = Object.assign(obj, item);
  };

  defineExpose({
    open,
    init,
  });

  let obj = reactive({
    ID: 0,
    Username: '',
    SystemRoleID: 0,
  });
  const objRule = {
    userId: [required],
    systemRole: [required],
  };
  const systemRoleItems = ref([]);

  const form = ref(null);
  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
  };

  const getRoleList = async (): Promise<void> => {
    const data: Role[] = await useRoleList(new Role());
    systemRoleItems.value = data.map((role) => {
      return {
        text: role.RoleCode === 'sysadmin' ? i18n.t('role.system.administrator') : i18n.t('role.system.normal'),
        value: role.ID,
      };
    });
  };

  const emit = defineEmits(['refresh']);
  const changeUserRole = async (): Promise<void> => {
    if (form.value.validate(true)) {
      await new User(obj).changeRole();
      reset();
      emit('refresh');
    }
  };

  onMounted(() => {
    nextTick(() => {
      getRoleList();
    });
  });
</script>
