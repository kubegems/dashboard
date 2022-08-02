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
  <v-form v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>路由策略</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.weight" class="my-0" label="weight" required type="number" />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.destination.host"
                  class="my-0"
                  label="host"
                  required
                  :rules="objRules.hostRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.destination.subset" class="my-0" label="subset" required />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.destination.port" class="my-0" label="port" required type="number" />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> 取消 </v-btn>
          <v-btn color="primary" small text @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
    <v-sheet v-for="(route, index) in routeCopy" :key="index" class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ route.destination.host }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> host </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ route.destination.subset }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> subset </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ route.destination.port ? route.destination.port.number : '' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> port </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0 kubegems__three-width" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ route.weight }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> weight </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateData(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeData(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加路由策略
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'RouteDestinationForm',
    props: {
      route: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        obj: {
          index: -1,
          weight: 0,
          destination: {
            host: '',
            subset: '',
            port: null,
          },
        },
        objRules: {
          hostRule: [required],
        },
        routeCopy: [],
      };
    },
    watch: {
      route() {
        if (this.routeCopy) {
          this.routeCopy = deepCopy(this.route);
        }
      },
    },
    mounted() {
      if (this.routeCopy) {
        this.routeCopy = deepCopy(this.route);
      }
    },
    methods: {
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.obj = deepCopy(this.$options.data().obj);
        this.$refs.form.resetValidation();
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          const data = deepCopy(this.obj);
          delete data['index'];
          if (this.obj.index === -1) {
            this.routeCopy.push(data);
          } else {
            this.$set(this.routeCopy, this.obj.index, data);
          }
          this.$emit('updateComponentData', this.routeCopy);
          this.closeCard();
        }
      },
      removeData(index) {
        this.$delete(this.routeCopy, index);
        this.$emit('updateComponentData', this.routeCopy);
      },
      updateData(index) {
        this.obj = deepCopy(this.routeCopy[index]);
        this.obj = { ...this.obj, index: index };
        this.expandCard();
      },
    },
  };
</script>
