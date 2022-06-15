<template>
  <BaseDialog v-model="dialog" icon="mdi-cube-outline" title="创建项目" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :step="step" />
    </template>
    <template #action>
      <v-btn v-if="step === 1" class="float-right mx-2" color="primary" :loading="Circular" text @click="addProject">
        确定
      </v-btn>
      <v-btn v-if="step === 1" class="float-right mx-2" color="primary" text @click="step = 0"> 上一步 </v-btn>
      <v-btn v-if="step === 0" class="float-right mx-2" color="primary" text @click="check"> 下一步 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ProjectBaseForm from './ProjectBaseForm';

  import { postAddProject, postAddProjectUser } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'AddProject',
    components: {
      ProjectBaseForm,
    },
    mixins: [BaseSelect],
    data: () => ({
      dialog: false,
      formComponent: 'ProjectBaseForm',
      step: 0,
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['Tenant']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      check() {
        if (this.$refs[this.formComponent].validate()) this.step = 1;
      },
      async addProject() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          const resdata = await postAddProject(this.Tenant().ID, {
            ProjectName: data.ProjectName,
            ProjectAlias: data.ProjectAlias,
            Remark: data.Remark,
          });
          if (data.Users.length > 0) {
            data.Users.forEach((user) => {
              postAddProjectUser(resdata.ID, {
                ProjectID: resdata.ID,
                UserID: user.ID,
                Role: user.Role,
              });
            });
          }
          await this.m_select_tenantProjectSelectData();
          this.reset();
          this.$emit('refresh');
        }
      },
      init() {
        this.$nextTick(() => {
          this.$refs[this.formComponent].init();
        });
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
      },
    },
  };
</script>
