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
  <v-form v-model="valid" class="ma-2" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>{{ $t('tip.auth') }}</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="authType"
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="authTypeItems"
                  :label="$t('tip.auth_type')"
                  :no-data-text="$root.$t('data.no_data')"
                  :rules="objRules.authTypeItemsRules"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small>
                      {{ item.text }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-flex>

              <div class="kubegems__clear-float" />
            </v-sheet>

            <template v-if="authType === 'passwd'">
              <v-sheet class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width" />
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field
                    v-model="obj.auth.username"
                    class="my-0"
                    :label="$root.$t('usernmae')"
                    required
                    :rules="objRules.usernameRule"
                  />
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field
                    v-model="obj.auth.password"
                    class="my-0"
                    :label="$root.$t('passwd')"
                    required
                    :rules="objRules.passwordRule"
                    type="password"
                  />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>
            <template v-else-if="authType === 'token'">
              <v-sheet class="pt-2 px-2">
                <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width" />
                <v-flex class="float-left ml-2 kubegems__long-width">
                  <v-textarea
                    v-model="obj.auth.token"
                    auto-grow
                    class="my-0"
                    label="Token"
                    required
                    :rules="objRules.tokenRule"
                  />
                </v-flex>
                <div class="kubegems__clear-float" />
              </v-sheet>
            </template>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ $root.$t('operate.cancel') }} </v-btn>
          <v-btn color="primary" :loading="Circular" small text @click="adminModelStorCheck">
            {{ $t('operate.check') }}
          </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ $root.$t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>

    <AuthItem
      v-if="objCopy.auth.username || objCopy.auth.token"
      :data="objCopy"
      @removeData="removeData"
      @updateData="updateData"
    />

    <v-flex v-else class="grey lighten-4 rounded my-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              {{ $root.$t('operate.add_c', [$t('tip.auth_setting')]) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../../i18n';
  import AuthItem from './AuthItem';
  import { postAdminModelStorCheck } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'Auth',
    i18n: {
      messages: messages,
    },
    components: {
      AuthItem,
    },
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        authType: 'token',
        obj: {
          auth: {
            username: '',
            token: '',
            password: '',
          },
        },
        objRules: {
          authTypeItemsRules: [required],
          usernameRule: [required],
          passwordRule: [required],
          tokenRule: [required],
        },
        objCopy: {
          auth: {},
        },
      };
    },
    computed: {
      ...mapState(['Circular']),
      authTypeItems() {
        return [
          { text: this.$t('tip.passwd_auth'), value: 'passwd' },
          { text: this.$t('tip.token_auth'), value: 'token' },
        ];
      },
    },
    watch: {
      data: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            this.objCopy = deepCopy(newValue);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async adminModelStorCheck() {
        if (this.$refs.form.validate(true)) {
          await postAdminModelStorCheck(this.obj);
        }
      },
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
        this.authType = 'token';
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          this.$emit('updateComponentData', deepCopy(this.obj));
          this.objCopy = deepCopy(this.obj);
          this.closeCard();
        }
      },
      removeData() {
        this.obj.auth = {
          username: '',
          token: '',
          password: '',
        };
        this.$emit('updateComponentData', deepCopy(this.obj));
      },
      updateData() {
        this.expandCard();
      },
    },
  };
</script>
