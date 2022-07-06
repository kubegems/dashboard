<template>
  <BaseDialog v-model="dialog" icon="mdi-cube" title="添加模型商店" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :step="step" title="模型商店" />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1"
        class="float-right mx-2"
        color="primary"
        :loading="Circular"
        text
        @click="addModelRegistry"
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
  import { postModelSource } from '@/api';

  export default {
    name: 'AddModelRegistry',
    components: {
      ModelRegistryBaseForm,
    },
    data() {
      return {
        dialog: false,
        formComponent: 'ModelRegistryBaseForm',
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
      async addModelRegistry() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          const resdata = await postModelSource(data);
          data.Users.forEach(async (user) => {
            await postAddVirtualSpaceUser(resdata.ID, {
              VirtualSpaceID: resdata.ID,
              UserID: user.ID,
              Role: user.Role,
            });
          });
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
      init() {
        this.formComponent = 'ModelRegistryBaseForm';
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
