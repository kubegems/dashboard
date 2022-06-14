<template>
  <BaseDialog v-model="dialog" icon="mdi-cube" title="创建环境" :width="1000" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :step="step" />
    </template>
    <template #action>
      <v-btn
        v-if="step === 2"
        class="float-right mx-2"
        color="primary"
        :loading="Circular"
        text
        @click="addEnvironment"
      >
        确定
      </v-btn>
      <v-btn v-if="step < 2" class="float-right mx-2" color="primary" text @click="check"> 下一步 </v-btn>
      <v-btn v-if="step > 0" class="float-right mx-2" color="primary" text @click="step -= 1"> 上一步 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import EnvironmentBaseForm from './EnvironmentBaseForm';

  import { postAddEnvironment, postAddEnvironmentUser } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'AddEnvironment',
    components: {
      EnvironmentBaseForm,
    },
    mixins: [BaseSelect],
    data: () => ({
      dialog: false,
      formComponent: 'EnvironmentBaseForm',
      projectid: 0,
      step: 0,
    }),
    computed: {
      ...mapState(['Circular', 'User', 'AdminViewport']),
      ...mapGetters(['Project']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      check() {
        if (!this.$refs[this.formComponent]) {
          return;
        }
        if (!this.$refs[this.formComponent].checkSaved()) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请保存数据',
            color: 'warning',
          });
          return;
        }
        if (this.$refs[this.formComponent].validate()) {
          this.step += 1;
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(projectID) {
        this.$nextTick(() => {
          this.$refs[this.formComponent].initUser(projectID);
        });
      },
      async addEnvironment() {
        if (!this.$refs[this.formComponent]) {
          return;
        }
        if (!this.$refs[this.formComponent].checkSaved()) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请保存数据',
            color: 'warning',
          });
          return;
        }
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData().data;
          const resdata = await postAddEnvironment(
            this.AdminViewport ? data.ProjectID : this.projectid > 0 ? this.projectid : this.Project().ID,
            {
              EnvironmentName: data.EnvironmentName,
              ClusterID: data.ClusterID,
              MetaType: data.MetaType,
              Namespace: data.Namespace,
              DeletePolicy: data.DeletePolicy,
              ProjectID: this.AdminViewport ? data.ProjectID : this.projectid > 0 ? this.projectid : this.Project().ID,
              Remark: data.Remark,
              CreatorID: this.User.ID,
              ResourceQuota: this.$refs[this.formComponent].generateUnit(),
              LimitRange: data.LimitRange,
            },
          );
          if (data.Users.length > 0) {
            data.Users.forEach((user) => {
              postAddEnvironmentUser(resdata.ID, {
                EnvironmentID: resdata.ID,
                UserID: user.ID,
                Role: user.Role,
              });
            });
          }
          if (this.Project().ID === resdata.ProjectID) {
            await this.m_select_projectEnvironmentSelectData(resdata.ProjectID);
          }
          this.reset();
          this.$emit('refresh', {
            ID: resdata.ProjectID,
          });
        }
      },
      reset() {
        this.dialog = false;
        this.step = 0;
        this.$refs[this.formComponent].reset();
      },
      // eslint-disable-next-line vue/no-unused-properties
      setProjectId(id) {
        this.projectid = id;
      },
    },
  };
</script>
