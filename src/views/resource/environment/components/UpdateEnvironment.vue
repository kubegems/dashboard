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
    :title="$root.$t('operate.update_c', [$root.$t('resource.environment')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" :edit="true" :step="step" />
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="Circular" text @click="updateEnvironment">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import EnvironmentBaseForm from './EnvironmentBaseForm';
  import { getEnvironmentDetail, putUpdateEnvironment } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'UpdateEnvironment',
    components: {
      EnvironmentBaseForm,
    },
    mixins: [BaseSelect],
    data: () => ({
      dialog: false,
      formComponent: 'EnvironmentBaseForm',
      users: [],
      step: 0,
    }),
    computed: {
      ...mapState(['Circular', 'User']),
      ...mapGetters(['Project', 'Tenant']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateEnvironment() {
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
          const resdata = await putUpdateEnvironment(data.ID, {
            EnvironmentID: data.ID,
            EnvironmentName: data.EnvironmentName,
            ClusterID: data.ClusterID,
            MetaType: data.MetaType,
            DeletePolicy: data.DeletePolicy,
            Namespace: data.Namespace,
            ProjectID: data.ProjectID,
            Remark: data.Remark,
            CreatorID: this.User.ID,
            ResourceQuota: data.ResourceQuota,
            LimitRange: data.LimitRange,
          });

          if (this.Project().ID === resdata.ProjectID) {
            await this.m_select_projectEnvironmentSelectData(this.Project().ID);
          }
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        const data = await getEnvironmentDetail(item.ID);
        data.Users.forEach((u) => {
          u.UserID = u.ID;
        });
        this.users = deepCopy(data.Users);
        this.$refs[this.formComponent].init(data);
      },
      reset() {
        this.dialog = false;
        this.step = 0;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
