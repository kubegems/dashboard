<template>
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <v-expand-transition>
        <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4">
          <v-card-text class="pa-0">
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width pt-5">
                <span>分析模版</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-autocomplete
                  v-model="analysisTemplate"
                  color="primary"
                  :items="analysisTemplateItems"
                  :rules="objRules.analysisTemplateRule"
                  label="分析模版"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                  @change="onAnalysisTemplateChange"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small class="mx-1">
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
                  color="primary"
                  :items="clusterScopeItems"
                  :rules="objRules.clusterScopeRule"
                  label="模版范围"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small class="mx-1">
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
                @updateArgs="updateArgs"
                @removeArgs="removeArgs"
                @expandCard="expandArgsCard"
              />
              <div class="kubegems__clear-float" />
            </v-card-text>
          </v-card-text>
          <v-card-actions class="pa-0">
            <v-spacer />
            <v-btn text small color="error" @click="closeCard"> 取消 </v-btn>
            <v-btn text small color="primary" @click="addData"> 保存 </v-btn>
          </v-card-actions>
        </v-card>
      </v-expand-transition>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { getStrategyDeployEnvironmentAppsAnalysisTempalte } from '@/api';
  import ArgsForm from './ArgsForm';
  import ArgsItem from './ArgsItem';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'AnalysisTemplateForm',
    components: {
      ArgsItem,
      ArgsForm,
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
      // eslint-disable-next-line vue/no-unused-properties
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
      // eslint-disable-next-line vue/no-unused-properties
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
