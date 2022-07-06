<template>
  <BaseDialog v-model="dialog" icon="mdi-cube" title="更新模型商店" :width="1000" @reset="reset">
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :edit="true"
        :item="item"
        :step="step"
        title="模型商店"
        @changeStep="changeStep"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1"
        class="float-right mx-2"
        color="primary"
        :loading="Circular"
        text
        @click="updateModelRegistry"
      >
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

  import ModelRegistryBaseForm from './ModelRegistryBaseForm';
  import { putModelSource, getModelSourceDetail } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateModelRegistry',
    components: {
      ModelRegistryBaseForm,
    },
    data() {
      return {
        dialog: false,
        formComponent: 'ModelRegistryBaseForm',
        step: 0,
        totalStep: 1,
        item: null,
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      changeStep(totalStep) {
        this.totalStep = totalStep;
      },
      async updateModelRegistry() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          await putModelSource(data.name, data);
          this.reset();
          this.$emit('refresh');
        }
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
      async init(item) {
        this.formComponent = 'ModelRegistryBaseForm';
        const data = await getModelSourceDetail(item.name);
        this.item = deepCopy(data);
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
        this.formComponent = 'ModelRegistryBaseForm';
      },
    },
  };
</script>
