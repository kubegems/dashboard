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
    icon="mdi-link"
    :title="$t('operate.link_c', [$root.$t('resource.app')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <component :is="formComponent" :ref="formComponent" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addApp">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import LinkAppBaseForm from './LinkAppBaseForm';
  import { postAddApp } from '@/api';

  export default {
    name: 'LinkApp',
    i18n: {
      messages: messages,
    },
    components: {
      LinkAppBaseForm,
    },
    data: () => ({
      dialog: false,
      formComponent: 'LinkAppBaseForm',
    }),
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['Tenant', 'Environment', 'Project']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addApp() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          if (this.Environment().ID === 0) {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$root.$t('tip.select_environment'),
              color: 'warning',
            });
            return;
          }
          await postAddApp(this.Tenant().ID, this.Project().ID, this.Environment().ID, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
