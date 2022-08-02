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
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <v-expand-transition>
        <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
          <v-card-text class="pa-0">
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width pt-5">
                <span>分析模版</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-autocomplete
                  v-model="analysisTemplate"
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="analysisTemplateItems"
                  label="分析模版"
                  no-data-text="暂无可选数据"
                  :rules="objRules.analysisTemplateRule"
                  @change="onAnalysisTemplateChange"
                >
                  <template #selection="{ item }">
                    <v-chip class="mx-1" color="primary" small>
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width pt-5">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="clusterScope"
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="clusterScopeItems"
                  label="模版范围"
                  no-data-text="暂无可选数据"
                  :rules="objRules.clusterScopeRule"
                >
                  <template #selection="{ item }">
                    <v-chip class="mx-1" color="primary" small>
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <ArgsForm ref="argsForm" :data="obj.args" @addData="addArgsData" />
            <BaseSubTitle title="参数" />
            <v-card-text class="pa-2">
              <ArgsItem
                :args="obj.args"
                @expandCard="expandArgsCard"
                @removeArgs="removeArgs"
                @updateArgs="updateArgs"
              />
              <div class="kubegems__clear-float" />
            </v-card-text>
          </v-card-text>
          <v-card-actions class="pa-0">
            <v-spacer />
            <v-btn color="error" small text @click="closeCard"> 取消 </v-btn>
            <v-btn color="primary" small text @click="addData"> 保存 </v-btn>
          </v-card-actions>
        </v-card>
      </v-expand-transition>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters } from 'vuex';

  import ArgsForm from './ArgsForm';
  import ArgsItem from './ArgsItem';
  import { getStrategyDeployEnvironmentAppsAnalysisTempalte } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'AnalysisTemplateForm',
    components: {
      ArgsForm,
      ArgsItem,
    },
    mixins: [BaseResource],
    props: {
      data: {
        type: Object,
        default: () => null,
      },
      service: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      analysisTemplate: '',
      clusterScope: 'true',
      clusterScopeItems: [{ text: '集群级别', value: 'true' }],
      analysisTemplateItems: [],
      obj: {
        templates: [],
        args: [],
      },
      objRules: {
        analysisTemplateRule: [required],
        clusterScopeRule: [required],
      },
      t: '',
    }),
    computed: {
      ...mapGetters(['Tenant', 'Environment', 'Project']),
      template() {
        const t = this.analysisTemplateItems.find((t) => {
          return t.value === this.analysisTemplate;
        });
        if (t) return t;
        return null;
      },
    },
    watch: {
      data() {
        this.obj = deepCopy(this.data);
        if (this.obj.templates && this.obj.templates.length > 0) {
          this.analysisTemplate = this.obj.templates[0].templateName;
        }
      },
    },
    mounted() {
      this.strategyDeployEnvironmentAppsAnalysisTempalte();
    },
    methods: {
      init(t) {
        this.t = t;
      },
      async strategyDeployEnvironmentAppsAnalysisTempalte() {
        const data = await getStrategyDeployEnvironmentAppsAnalysisTempalte(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
          {
            noprocessing: true,
          },
        );
        this.analysisTemplateItems = data;
        data.forEach((d) => {
          d.text = d.metadata.name;
          d.value = d.metadata.name;
          d.data = d;
        });
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          this.obj.templates = [{ templateName: this.analysisTemplate, clusterScope: true }];
          this.$emit('addData', this.obj, this.t);
        }
      },
      onAnalysisTemplateChange() {
        if (this.template) {
          this.template.spec.args.forEach((args) => {
            if (
              args.name === 'service-name' ||
              !this.obj.args.find((arg) => {
                return arg.name === 'service-name';
              })
            ) {
              this.obj.args.push({ name: 'service-name', value: this.service });
            } else if (
              args.name === 'namespace' ||
              !this.obj.args.find((arg) => {
                return arg.name === 'namespace';
              })
            ) {
              this.obj.args.push({
                name: 'namespace',
                value: this.$route.query.namespace,
              });
            }
          });
        }
      },
      addArgsData(data) {
        this.obj.args = data;
      },
      removeArgs(index) {
        this.$delete(this.obj.args, index);
      },
      updateArgs(index) {
        const data = this.obj.args[index];
        this.$nextTick(() => {
          this.$refs.argsForm.init(data);
          this.expand = true;
        });
      },
      expandCard() {
        this.expand = true;
      },
      expandArgsCard() {
        this.$refs.argsForm.expandCard();
      },
      closeCard() {
        this.expand = false;
        this.analysisTemplate = '';
        this.$emit('closeOverlay');
        this.reset();
      },
      reset() {
        this.expand = false;
        this.$refs.argsForm.closeCard();
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
    },
  };
</script>
