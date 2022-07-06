<template>
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="模版定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              label="名称"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.showName"
              class="my-0"
              label="规则描述"
              required
              :rules="objRules.showNameRule"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="obj.expr" class="my-0" label="expr" required :rules="objRules.exprRule" />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="labels"
              height="32"
              hide-no-data
              :items="[]"
              label="标签(回车)"
              multiple
              :search-input.sync="labelText"
              @change="onLabelChange"
              @keydown.enter="createLabel"
            >
              <template #selection="{ item }">
                <v-chip class="pa-1" color="primary" small>
                  <span>
                    {{ item.text }}
                  </span>
                  <v-icon small @click="removeLabel(item)"> mdi-close </v-icon>
                </v-chip>
              </template>
            </v-combobox>
          </v-col>
          <v-col cols="12">
            <v-autocomplete
              v-model="obj.unit"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_metrics_unitItems"
              label="单位"
              no-data-text="暂无可选数据"
              :rules="objRules.unitRule"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  <span>
                    {{ item['text'] }}
                  </span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';
  import Metrics from '@/views/observe/monitor/mixins/metrics';

  export default {
    name: 'TemplateBaseForm',
    mixins: [Metrics],
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
    data: () => ({
      valid: false,
      expand: false,
      labels: [],
      labelText: '',
      obj: {
        name: '',
        showName: '',
        expr: '',
        labels: [],
        unit: [],
      },
    }),
    computed: {
      objRules() {
        return {
          nameRule: [required],
          showNameRule: [required],
          exprRule: [required],
          unitRule: [required],
        };
      },
    },
    watch: {
      item: {
        handler() {
          if (this.item) {
            this.obj = deepCopy(this.item);
            this.labels = this.obj.labels.map((l, index) => {
              return { text: l, value: index };
            });
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onLabelChange() {
        const labels = this.labels.filter((label) => {
          return label !== '' && typeof label === 'object';
        });
        this.labels = labels;
      },
      createLabel() {
        if (!this.labelText) return;
        const index = this.labels.length;
        this.labels.push({
          text: this.labelText,
          value: index,
        });
        this.labelText = '';
      },
      removeLabel(item) {
        const labels = this.labels.filter((label) => {
          return label.value !== item.value;
        });
        this.labels = labels;
      },
      reset() {
        this.$refs.form.reset();
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      setData(data) {
        this.obj = data;
      },
      getData() {
        this.obj.labels = this.labels.map((l) => {
          return l.text;
        });
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
