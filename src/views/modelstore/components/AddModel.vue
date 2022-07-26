<template>
  <BaseDialog v-model="dialog" icon="mdi-cube" title="添加模型" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :step="step" title="模型" />
    </template>
    <template #action>
      <v-btn v-if="step === totalStep - 1" class="float-right mx-2" color="primary" :loading="Circular" text>
        确定
      </v-btn>
      <v-btn v-if="step >= 0 && step < totalStep - 1" class="float-right mx-2" color="primary" text @click="nextStep">
        下一步
      </v-btn>
      <v-btn v-if="step > 0 && step <= totalStep - 1" class="float-right mx-2" color="primary" text @click="lastStep">
        上一步
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import ModelBaseForm from './ModelBaseForm';

  export default {
    name: 'AddModel',
    components: {
      ModelBaseForm,
    },
    data() {
      return {
        dialog: false,
        formComponent: 'ModelBaseForm',
        step: 0,
        totalStep: 2,
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      lastStep() {
        if (this.step > 0) {
          const data = this.$refs[this.formComponent].getData();
          this.step -= 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].back(data);
          });
        }
      },
      nextStep() {
        if (this.step < this.totalStep - 1 && this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          this.step += 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      init() {
        this.formComponent = 'ModelBaseForm';
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
        this.formComponent = 'ModelBaseForm';
      },
    },
  };
</script>
