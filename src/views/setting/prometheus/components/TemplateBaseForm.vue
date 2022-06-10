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
              required
              label="名称"
              :rules="objRules.nameRule"
              :readonly="edit"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.showName"
              class="my-0"
              required
              label="规则描述"
              :rules="objRules.showNameRule"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="obj.expr" class="my-0" required label="expr" :rules="objRules.exprRule" />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="labels"
              hide-no-data
              :items="[]"
              :search-input.sync="labelText"
              multiple
              label="标签(回车)"
              height="32"
              @change="onLabelChange"
              @keydown.enter="createLabel"
            >
              <template #selection="{ item }">
                <v-chip small color="primary" class="pa-1">
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
              v-model="obj.units"
              color="primary"
              :items="units"
              :rules="objRules.unitRule"
              multiple
              label="单位"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
            >
              <template #selection="{ item }">
                <v-chip color="primary" small class="mx-1">
                  <span>
                    {{ item['text'] }}
                  </span>
                  <v-icon small @click="removeUnit(item)"> mdi-close </v-icon>
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

  export default {
    name: 'TemplateBaseForm',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      units: {
        type: Array,
        default: () => [],
      },
      edit: {
        type: Boolean,
        default: () => false,
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
        units: [],
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
      removeUnit(item) {
        const val = item.value;
        const index = this.obj.units.indexOf(val);
        this.obj.units.splice(index, 1);
      },
      // eslint-disable-next-line vue/no-unused-properties
      reset() {
        this.$refs.form.reset();
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      // eslint-disable-next-line vue/no-unused-properties
      setData(data) {
        this.obj = data;
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        this.obj.labels = this.labels.map((l) => {
          return l.text;
        });
        return this.obj;
      },
      // eslint-disable-next-line vue/no-unused-properties
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
