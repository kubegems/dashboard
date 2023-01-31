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
  <v-card class="pa-2" flat>
    <v-card-title class="pa-0">
      <v-spacer />
      <v-btn color="primary" small text @click="generateAccessToken">
        <v-icon left small>mdi-key-chain-variant</v-icon>
        {{ i18nLocal.t('operate.generate_c', [i18nLocal.t('setting.tip.auth')]) }}
      </v-btn>
    </v-card-title>
    <v-data-table
      class="mx-2"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
    >
      <template #item.token="{ item }">
        {{ `*********${item.token.substr(item.token.length - 20, 12)}*********` }}
        <v-btn v-clipboard:copy="item.token" v-clipboard:success="copyed" color="primary" icon small>
          <v-icon small> mdi-content-copy</v-icon>
        </v-btn>
      </template>
      <template #item.expireAt="{ item }">
        {{ item.expireAt ? moment(item.expireAt).format('lll') : '' }}
      </template>
      <template #item.createdAt="{ item }">
        {{ item.createdAt ? moment(item.createdAt).format('lll') : '' }}
      </template>
      <template #item.expired="{ item }">
        {{ item.expired ? i18nLocal.t('auth.table.yes') : i18nLocal.t('auth.table.no') }}
      </template>
      <template #item.action="{ item }">
        <v-flex :id="`r${item.id}`" />
        <v-menu :attach="`#r${item.id}`" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="error" small text @click="removeToken(item)"> {{ i18n.t('operate.delete') }} </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-data-table>
    <BasePagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :page-count="pagination.pageCount"
      :size="pagination.size"
      @changepage="pageChange"
      @changesize="sizeChange"
      @loaddata="getAccessTokenList"
    />

    <GenerateToken ref="generateToken" @refresh="getAccessTokenList" />
  </v-card>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { onMounted, reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import GenerateToken from './GenerateToken.vue';
  import { useAccessTokenPagination } from '@/composition/auth';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { AccessToken, Auth } from '@/types/auth';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const headers = [
    { text: 'token', value: 'token', align: 'start' },
    { text: 'scope', value: 'scope', align: 'start' },
    { text: i18nLocal.t('auth.table.grant_type'), value: 'grantType', align: 'start' },
    { text: i18nLocal.t('auth.table.expired'), value: 'expired', align: 'start' },
    { text: i18nLocal.t('auth.table.expire_at'), value: 'expireAt', align: 'start' },
    { text: i18n.t('resource.create_at'), value: 'createdAt', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<AccessToken> = reactive<Pagination<AccessToken>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getAccessTokenList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<AccessToken> = await useAccessTokenPagination(new Auth(), params.page, params.size);
    pagination = Object.assign(pagination, data);
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const generateToken = ref(null);
  const generateAccessToken = (): void => {
    generateToken.value.open();
  };

  const removeToken = async (item: any): Promise<void> => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', ['Token']),
      content: {
        text: i18n.t('operate.delete_c', ['Token']),
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        await new Auth().removeAccesstoken(param.item);
        getAccessTokenList();
      },
    });
  };

  const copyed = () => {
    store.commit('SET_SNACKBAR', {
      text: i18nLocal.t('auth.tip.copyed'),
      color: 'success',
    });
  };

  onMounted(() => {
    getAccessTokenList();
  });
</script>
