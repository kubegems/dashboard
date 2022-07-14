<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle title="大盘定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-text-field v-model="obj.name" class="my-0" label="名称" required :rules="objRules.nameRule" />
        </v-col>
        <template v-if="!edit">
          <v-col cols="12">
            <v-switch v-model="tamplate" hide-details label="从模版创建" />
          </v-col>
          <v-col v-if="tamplate" cols="12">
            <v-autocomplete
              v-model="obj.template"
              class="my-0"
              color="primary"
              hide-selected
              :items="templateItems"
              label="模版"
              no-data-text="暂无可选数据"
              :rules="objRules.templateRule"
            />
          </v-col>
        </template>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { getMonitorDashboardTemplate } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'DashboardBaseForm',
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
        tamplate: false,
        templateItems: [],
        obj: {
          name: '',
          template: '',
        },
        objRules: {
          nameRule: [required],
          templateRule: [required],
        },
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.monitorDashboardTemplateList();
      });
    },
    methods: {
      async monitorDashboardTemplateList() {
        const data = await getMonitorDashboardTemplate();
        if (data) {
          this.templateItems = data.map((d) => {
            return { text: d.name, value: d.name };
          });
        }
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
    },
  };
</script>
