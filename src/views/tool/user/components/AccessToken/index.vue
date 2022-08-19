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
        {{ $t('operate.generate_c', [$t('setting.tip.auth')]) }}
      </v-btn>
    </v-card-title>
    <v-data-table
      class="mx-2"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="items"
      :items-per-page="params.size"
      :no-data-text="$root.$t('data.no_data')"
      :page.sync="params.page"
    >
      <template #[`item.token`]="{ item }">
        {{ `*********${item.token.substr(item.token.length - 20, 12)}*********` }}
        <v-btn v-clipboard:copy="item.token" v-clipboard:success="onCopy" color="primary" icon small>
          <v-icon small> mdi-content-copy</v-icon>
        </v-btn>
      </template>
      <template #[`item.expireAt`]="{ item }">
        {{ item.expireAt ? $moment(item.expireAt).format('lll') : '' }}
      </template>
      <template #[`item.createdAt`]="{ item }">
        {{ item.createdAt ? $moment(item.createdAt).format('lll') : '' }}
      </template>
      <template #[`item.expired`]="{ item }">
        {{ item.expired ? $t('auth.table.yes') : $t('auth.table.no') }}
      </template>
      <template #[`item.action`]="{ item }">
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
                <v-btn color="error" small text @click="removeToken(item)"> {{ $root.$t('operate.delete') }} </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-data-table>
    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :page-count="pageCount"
      :size="params.size"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
      @loaddata="tokenList"
    />

    <GenerateToken ref="generateToken" @refresh="tokenList" />
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import GenerateToken from './GenerateToken';
  import { deleteToken, getTokenList } from '@/api';

  export default {
    name: 'AccessToken',
    i18n: {
      messages: messages,
    },
    components: {
      GenerateToken,
    },
    data() {
      return {
        items: [],
        pageCount: 0,
      };
    },
    computed: {
      ...mapState(['JWT', 'User']),
      params() {
        return {
          page: 1,
          size: 10,
        };
      },
      headers() {
        return [
          { text: 'token', value: 'token', align: 'start' },
          { text: 'scope', value: 'scope', align: 'start' },
          { text: this.$t('auth.table.grant_type'), value: 'grantType', align: 'start' },
          { text: this.$t('auth.table.expired'), value: 'expired', align: 'start' },
          { text: this.$t('auth.table.expire_at'), value: 'expireAt', align: 'start' },
          { text: this.$root.$t('resource.create_at'), value: 'createdAt', align: 'start' },
          { text: '', value: 'action', align: 'center', width: 20 },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        this.tokenList();
      }
    },
    methods: {
      onActionStatusChange() {
        this.tokenList();
      },
      async tokenList() {
        const data = await getTokenList(this.params);
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      generateAccessToken() {
        this.$refs.generateToken.open();
      },
      removeToken(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', ['Token']),
          content: {
            text: this.$root.$t('operate.delete_c', ['Token']),
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await deleteToken(param.item.id);
            this.tokenList();
          },
        });
      },
      onCopy() {
        this.$store.commit('SET_SNACKBAR', {
          text: this.$t('auth.tip.copyed'),
          color: 'success',
        });
      },
    },
  };
</script>
