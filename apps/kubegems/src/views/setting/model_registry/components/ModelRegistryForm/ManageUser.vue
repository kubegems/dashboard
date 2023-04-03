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
  <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
    <BaseSubTitle :title="i18nLocal.t('tip.model_admin')" />
    <v-card-text class="pa-2">
      <v-tabs v-model="state.tab" class="pa-2" height="30px" vertical>
        <v-tab v-for="item in tabItems" :key="item.value">
          {{ item.text }}
        </v-tab>
        <v-tab-item v-for="item in tabItems" :key="item.value" :reverse-transition="false" :transition="false">
          <v-card flat>
            <v-row class="pa-0 ma-0">
              <v-col class="py-1" cols="6">
                <v-card elevation="2" flat height="550px">
                  <v-card-text>
                    <v-flex class="px-1 mb-2">{{ i18n.t('resource.account') }}</v-flex>
                    <v-text-field
                      v-model="searchForAll"
                      class="mx-1"
                      dense
                      hide-details
                      prepend-inner-icon="mdi-magnify"
                      @keyup="searchAllUser"
                    />
                    <v-list dense height="450px" :style="{ overflowY: `auto` }">
                      <v-list-item
                        v-for="(user, index) in allUserItems"
                        :key="index"
                        link
                        @click="addRole(user, index)"
                      >
                        <v-list-item-avatar class="my-1">
                          <v-avatar class="white--text font-weight-medium" color="primary" :size="32">
                            {{ user.Username[0].toLocaleUpperCase() }}
                          </v-avatar>
                        </v-list-item-avatar>
                        <v-list-item-content class="text-subtitle-1">
                          {{ user.Username }}
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col class="py-1" cols="6">
                <v-card elevation="2" flat height="550px">
                  <v-card-text>
                    <v-flex class="px-1 mb-2"> {{ i18n.t('role.model.admin') }} </v-flex>
                    <v-text-field
                      v-model="searchForRegistry"
                      class="mx-1"
                      dense
                      hide-details
                      prepend-inner-icon="mdi-magnify"
                      @keyup="searchRegistryUser"
                    />
                    <v-list dense height="450px" :style="{ overflowY: `auto` }">
                      <v-list-item
                        v-for="(username, index) in modelUserItems"
                        :key="index"
                        link
                        @click="removeRole(username, index)"
                      >
                        <v-list-item-avatar class="my-1">
                          <v-avatar class="white--text font-weight-medium" color="primary" :size="32">
                            {{ username[0].toLocaleUpperCase() }}
                          </v-avatar>
                        </v-list-item-avatar>
                        <v-list-item-content class="text-subtitle-1">
                          {{ username }}
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import { useRegistryUserList } from '@/composition/ai_model';
  import { useUserList } from '@/composition/user';
  import { AIModelRegistry } from '@/types/ai_model';
  import { User } from '@/types/user';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const props = withDefaults(
    defineProps<{
      edit?: boolean;
      item?: AIModelRegistry;
    }>(),
    {
      edit: false,
      item: undefined,
    },
  );

  const state = reactive({
    valid: false,
    tab: 0,
  });
  const obj = ref<AIModelRegistry>(new AIModelRegistry());

  const tabItems = [{ text: i18n.t('role.model.admin'), value: 'admin' }];

  const allUserItems = ref<User[]>([]);
  const allUserItemsCopy = ref<User[]>([]);
  const userList = async (): Promise<void> => {
    const data = await useUserList(new User());
    allUserItems.value = data.filter((d) => {
      return !modelUserItems.value.find((username) => {
        return username === d.Username;
      });
    });
    allUserItemsCopy.value = deepCopy(allUserItems.value);
  };

  const modelUserItems = ref<string[]>([]);
  const modelUserItemsCopy = ref<string[]>([]);
  const modelUserList = async (): Promise<void> => {
    const data = await useRegistryUserList(new AIModelRegistry({ name: props.item.name }));
    modelUserItems.value = data;
    modelUserItemsCopy.value = deepCopy(modelUserItems.value);
  };

  const searchForAll = ref<string>('');
  const searchAllUser = (): void => {
    allUserItems.value = allUserItemsCopy.value.filter((u) => {
      return u.Username.indexOf(searchForAll.value) > -1;
    });
  };

  const searchForRegistry = ref<string>('');
  const searchRegistryUser = (): void => {
    modelUserItems.value = modelUserItemsCopy.value.filter((username) => {
      return username.indexOf(searchForRegistry.value) > -1;
    });
  };

  const addRole = async (user, index): Promise<void> => {
    allUserItems.value.splice(index, 1);
    modelUserItems.value.push(user);
    if (props.edit) {
      await new AIModelRegistry({ name: props.item.name }).addUser(user);
    }
  };

  const removeRole = async (user, index): Promise<void> => {
    modelUserItems.value.splice(index, 1);
    allUserItems.value.push(user);
    if (props.edit) {
      await new AIModelRegistry({ name: props.item.name }).deleteUser(user);
    }
  };

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      obj.value = newValue;
      await modelUserList();
      await userList();
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const form = ref(null);
  const validate = (): boolean => {
    return form.value.validate(true);
  };

  const getData = (): AIModelRegistry => {
    return obj.value;
  };

  const reset = (): void => {
    form.value.resetValidation();
    obj.value = new AIModelRegistry();
  };

  defineExpose({
    validate,
    getData,
    reset,
  });
</script>
