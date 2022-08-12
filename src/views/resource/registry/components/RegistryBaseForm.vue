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
  <v-flex>
    <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.image_registry')])" />
    <v-card-text class="pa-2">
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-sheet>
          <v-switch v-model="obj.EnableExtends" class="mb-4" hide-details :label="$t('tip.enable_scan')" />
          <v-text-field
            v-model="obj.RegistryName"
            class="my-0"
            :label="$t('table.name')"
            :readonly="edit"
            required
            :rules="objRules.RegistryNameRules"
          />
          <v-autocomplete
            v-if="AdminViewport"
            v-model="obj.ProjectID"
            class="my-0"
            color="primary"
            hide-selected
            :items="m_select_projectItems"
            :label="$root.$t('resource.project')"
            :no-data-text="$root.$t('data.no_data')"
            :rules="objRules.ProjectRules"
            @focus="onProjectSelectFocus"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
          <v-flex>
            <v-row>
              <v-col class="pr-0" cols="3">
                <v-menu
                  v-model="prefixscheme"
                  bottom
                  :close-on-content-click="false"
                  content-class="tag-menu"
                  nudge-bottom="5px"
                  offset-y
                  origin="top center"
                  right
                  transition="scale-transition"
                >
                  <template #activator="{ on }">
                    <v-chip class="primary--text float-left mt-3 font-weight-medium" color="white" label v-on="on">
                      {{ scheme.toLocaleUpperCase() }}
                      <v-icon v-if="prefixscheme" right small> mdi-chevron-up </v-icon>
                      <v-icon v-else right small> mdi-chevron-down </v-icon>
                    </v-chip>
                  </template>
                  <v-data-iterator hide-default-footer :items="[{ text: 'scheme', values: ['http', 'https'] }]">
                    <template #default="props">
                      <v-card v-for="iterdata in props.items" :key="iterdata.text" flat>
                        <v-list dense>
                          <v-list-item
                            v-for="(prefixscheme, index) in iterdata.values"
                            :key="index"
                            class="text-body-2 text-center"
                            link
                            :style="{ color: prefixscheme === scheme ? `#1e88e5 !important` : `` }"
                            @click="setScheme(prefixscheme)"
                          >
                            <v-list-item-content>
                              <span>
                                {{ prefixscheme.toLocaleUpperCase() }}
                              </span>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </template>
                  </v-data-iterator>
                </v-menu>
              </v-col>
              <v-col class="pl-0" cols="9">
                <v-text-field
                  v-model="obj.RegistryAddress"
                  class="my-0"
                  :label="$t('table.address')"
                  required
                  :rules="objRules.RegistryAddressRules"
                />
              </v-col>
            </v-row>
          </v-flex>
          <v-text-field
            v-model="obj.Username"
            class="my-0"
            :label="$t('table.username')"
            required
            :rules="objRules.UsernameRules"
          />
          <v-text-field
            v-model="obj.Password"
            class="my-0"
            :label="$t('table.passwd')"
            required
            :rules="objRules.PasswordRules"
            type="password"
          />
        </v-sheet>
      </v-form>
    </v-card-text>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'RegistryBaseForm',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      valid: false,
      prefixscheme: false,
      scheme: 'https',
      obj: {
        RegistryName: '',
        RegistryAddress: '',
        Username: '',
        Password: '',
        UpdateTime: new Date(),
        CreatorID: 0,
        ProjectID: 0,
        IsDefault: false,
        EnableExtends: false,
      },
    }),
    computed: {
      ...mapState(['Circular', 'User', 'AdminViewport']),
      ...mapGetters(['Project']),
      objRules() {
        return {
          RegistryNameRules: [required, k8sName],
          RegistryAddressRules: [required],
          UsernameRules: [required],
          PasswordRules: [required],
          ProjectRules: [required],
        };
      },
    },
    mounted() {
      if (!this.AdminViewport) {
        this.obj.ProjectID = this.Project().ID;
      } else {
        this.m_select_projectSelectData();
      }
      this.obj.CreatorID = this.User.ID;
    },
    methods: {
      setScheme(scheme) {
        this.scheme = scheme;
        this.prefixscheme = false;
      },
      reset() {
        this.$refs.form.reset();
      },
      setData(data) {
        this.obj = data;
      },
      getData() {
        const obj = deepCopy(this.obj);
        obj.RegistryAddress = `${this.scheme}://${obj.RegistryAddress}`;
        return obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      onProjectSelectFocus() {
        this.m_select_projectSelectData();
      },
    },
  };
</script>
