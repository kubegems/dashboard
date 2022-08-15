<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <BaseDialog
    v-model="dialog"
    icon="mdi-cube"
    :title="$root.$t('operate.create_c', [$root.$t('resource.environment')])"
    :width="1000"
    @reset="reset"
  >
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
        {{ $root.$t('operate.confirm') }}
      </v-btn>
      <v-btn v-if="step < 2" class="float-right mx-2" color="primary" text @click="check">
        {{ $root.$t('operate.next') }}
      </v-btn>
      <v-btn v-if="step > 0" class="float-right mx-2" color="primary" text @click="step -= 1">
        {{ $root.$t('operate.previous') }}
      </v-btn>
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
      open() {
        this.dialog = true;
      },
      check() {
        if (!this.$refs[this.formComponent]) {
          return;
        }
        if (!this.$refs[this.formComponent].checkSaved()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.save_data'),
            color: 'warning',
          });
          return;
        }
        if (this.$refs[this.formComponent].validate()) {
          this.step += 1;
        }
      },
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
            text: this.$root.$t('tip.save_data'),
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
      setProjectId(id) {
        this.projectid = id;
      },
    },
  };
</script>
