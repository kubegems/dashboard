<template>
  <BaseDialog v-model="dialog" :width="1000" title="创建虚拟空间" icon="mdi-cloud-outline" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :step="step" title="虚拟空间" />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        :loading="Circular"
        @click="addVirtualSpace"
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
  import { postAddVirtualSpace, postAddVirtualSpaceEnvironment, postAddVirtualSpaceUser } from '@/api';
  import VirtualSpaceBaseForm from './VirtualSpaceBaseForm';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AddVirtualSpace',
    components: {
      VirtualSpaceBaseForm,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      formComponent: 'VirtualSpaceBaseForm',
      step: 0,
      totalStep: 3,
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async addVirtualSpace() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          const resdata = await postAddVirtualSpace({
            VirtualSpaceName: data.VirtualSpaceName,
          });
          data.Environments.forEach(async (env) => {
            await postAddVirtualSpaceEnvironment(resdata.ID, {
              VirtualSpaceID: resdata.ID,
              ...env,
            });
          });
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
        if (this.step === 1 && this.$refs[this.formComponent].obj.Environments.length === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请关联环境',
            color: 'warning',
          });
          return;
        }
        if (this.step < this.totalStep - 1 && this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          this.step += 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      init() {
        this.formComponent = 'VirtualSpaceBaseForm';
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
        this.formComponent = 'VirtualSpaceBaseForm';
      },
    },
  };
</script>
