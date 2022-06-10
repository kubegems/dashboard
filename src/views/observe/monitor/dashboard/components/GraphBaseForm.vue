<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <BaseSubTitle title="监控图定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.name"
            class="my-0"
            :rules="objRules.nameRule"
            required
            label="名称"
            :readonly="edit"
          />
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="mode"
            color="primary"
            :items="modeItems"
            :rules="objRules.modeRule"
            label="模式"
            hide-selected
            class="my-0"
            no-data-text="暂无可选数据"
            :readonly="edit"
            @change="onModeChange"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small class="mx-1">
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <!-- 资源 -->
        <template v-if="mode === 'template'">
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.promqlGenerator.resource"
              color="primary"
              :items="resourceItems"
              :rules="objRules.resourceRule"
              label="资源"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @change="onResourceChange"
            >
              <template #selection="{ item }">
                <v-chip color="primary" small class="mx-1">
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <!-- 资源 -->

          <!-- 规则 -->
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.promqlGenerator.rule"
              color="primary"
              :items="ruleItems"
              :rules="objRules.ruleRule"
              :disabled="!obj.promqlGenerator.resource"
              label="规则"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @change="onRuleChange"
            >
              <template #selection="{ item }">
                <v-chip color="primary" small class="mx-1">
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <!-- 规则 -->

          <!-- 单位 -->
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.promqlGenerator.unit"
              color="primary"
              label="单位"
              class="my-0"
              no-data-text="暂无可选数据"
              hide-selected
              :items="unitItems"
              :rules="unitItems.length ? objRules.unitRule : undefined"
              :disabled="!obj.promqlGenerator.rule || !unitItems.length"
            >
              <template #selection="{ item }">
                <v-chip color="primary" small class="mx-1">
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </template>
        <template v-if="mode === 'ql'">
          <v-col cols="12">
            <v-textarea v-model="obj.expr" label="查询语句" auto-grow :rules="objRules.exprRule" />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.unit"
              color="primary"
              label="单位"
              class="my-0"
              no-data-text="暂无可选数据"
              hide-selected
              :items="unitAllItems"
            >
              <template #selection="{ item }">
                <v-chip color="primary" small class="mx-1">
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </template>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';
  import { getSystemConfigData, getMyConfigData } from '@/api';
  import { required } from '@/utils/rules';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'GraphBaseForm',
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        obj: {
          name: '',
          promqlGenerator: {
            resource: '',
            rule: '',
            unit: '',
          },
          expr: '',
          unit: '',
        },
        objRules: {
          nameRule: [required],
          resourceRule: [required],
          ruleRule: [required],
          unitRule: [required],
          exprRule: [required],
          modeRule: [required],
        },
        metricsConfig: {},
        mode: 'template',
        modeItems: [
          { text: '由模版生成', value: 'template' },
          { text: '由PromQl生成', value: 'ql' },
        ],
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      resourceItems() {
        const resourcesObj = this.metricsConfig.resources || {};
        return Object.keys(resourcesObj).map((key) => {
          if (resourcesObj[key].namespaced) {
            return {
              text: resourcesObj[key].showName,
              value: key,
            };
          }
        });
      },
      ruleItems() {
        if (this.metricsConfig.resources && this.obj.promqlGenerator.resource) {
          const rulesObj = this.metricsConfig.resources[this.obj.promqlGenerator.resource].rules;
          return Object.keys(rulesObj).map((key) => ({
            text: rulesObj[key].showName,
            value: key,
          }));
        }

        return [];
      },
      unitItems() {
        if (this.metricsConfig.resources && this.obj.promqlGenerator.resource && this.obj.promqlGenerator.rule) {
          const units =
            this.metricsConfig.resources[this.obj.promqlGenerator.resource].rules[this.obj.promqlGenerator.rule]
              .units || [];
          return units.map((unit) => ({
            text: this.metricsConfig.units[unit],
            value: unit,
          }));
        }
        return [];
      },
      unitAllItems() {
        const units = this.metricsConfig.units || {};
        return Object.keys(units).map((unit) => ({
          text: this.metricsConfig.units[unit],
          value: unit,
        }));
      },
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            this.mode = this.obj.promqlGenerator ? 'template' : 'ql';
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.getMonitorConfig();
      });
    },
    methods: {
      async getMonitorConfig() {
        let data = {};
        if (this.AdminViewport) {
          data = await getSystemConfigData('Monitor');
        } else {
          data = await getMyConfigData('Monitor');
        }
        this.metricsConfig = data.content || {};
      },
      onModeChange() {
        if (this.mode === 'template') {
          this.obj.promqlGenerator = {
            resource: '',
            rule: '',
            unit: '',
          };
          this.obj.expr = null;
          this.obj.unit = null;
        } else if (this.mode === 'ql') {
          this.obj.promqlGenerator = null;
          this.obj.expr = '';
          this.obj.unit = '';
        }
      },
      onResourceChange() {
        this.obj.promqlGenerator.rule = '';
        this.obj.promqlGenerator.unit = '';
      },
      onRuleChange() {
        this.obj.promqlGenerator.unit = '';
      },
      // eslint-disable-next-line vue/no-unused-properties
      validate() {
        return this.$refs.form.validate(true);
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        return this.obj;
      },
      // eslint-disable-next-line vue/no-unused-properties
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
        this.mode = 'template';
      },
    },
  };
</script>
