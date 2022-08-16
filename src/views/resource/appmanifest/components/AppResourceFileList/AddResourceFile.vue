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
    icon="mdi-wrench"
    :title="$root.$t('operate.add_c', [$t('tip.resource_file')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :app="app"
        :kind="kind"
        :step="step"
        title="Kustomize"
        @change="onKindChange"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1 || formComponent === 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        :loading="Circular"
        text
        @click="addResourceFile"
      >
        {{ $root.$t('operate.confirm') }}
      </v-btn>
      <v-btn
        v-if="step >= 0 && step < totalStep - 1 && formComponent !== 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="nextStep"
      >
        {{ $root.$t('operate.next') }}
      </v-btn>
      <v-btn
        v-if="step > 0 && step <= totalStep - 1 && formComponent !== 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="lastStep"
      >
        {{ $root.$t('operate.previous') }}
      </v-btn>
    </template>
    <template #header-action>
      <v-switch
        :key="switchKey"
        v-model="yaml"
        class="ma-0 pl-2 ml-2 mt-1"
        color="white"
        hide-details
        :style="{ marginTop: `8px !important` }"
        @change="onYamlSwitchChange"
      >
        <template #label>
          <span class="text-subject-1 white--text font-weight-medium"> YAML </span>
        </template>
      </v-switch>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import AppResourceBaseForm from './AppResourceBaseForm';
  import { patchAppResourceFile } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy, randomString } from '@/utils/helpers';

  export default {
    name: 'AddResourceFile',
    i18n: {
      messages: messages,
    },
    components: {
      AppResourceBaseForm,
    },
    mixins: [BaseResource],
    inject: ['reload'],
    data: () => ({
      dialog: false,
      yaml: false,
      formComponent: 'AppResourceBaseForm',
      kind: '',
      step: 0,
      totalStep: 1,
      app: null,
      switchKey: '',
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addResourceFile() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            const jsondata = this.$yamlload(data);

            let kind = this.kind.toLocaleLowerCase();
            if (!kind) {
              kind = jsondata?.kind?.toLocaleLowerCase();
            }
            kind = ['deployment', 'statefulset', 'daemonset'].indexOf(kind) > -1 ? 'workload' : kind;

            const mixinjson = require(`@/views/resource/${kind}/mixins/schema.js`);
            if (!this.m_resource_validateJsonSchema(mixinjson.default.data().schema, jsondata)) {
              return;
            }
            data = this.$yamldump(this.m_resource_beautifyData(jsondata));
          } else if (this.formComponent === 'AppResourceBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.$yamldump(this.m_resource_beautifyData(data));
          }
          const filename = this.getFileName(this.$yamlload(data));
          await patchAppResourceFile(
            this.app.TenantID,
            this.app.ProjectID,
            this.ThisAppEnvironmentID,
            this.app.name,
            filename,
            {
              content: data,
            },
          );
          this.reset();
          this.$emit('refresh');
          if (['Deployment', 'DaemonSet', 'StatefulSet'].indexOf(this.kind) > -1) {
            await this.$router.replace({
              query: Object.assign({
                ...this.$route.query,
                ...{ type: this.kind },
              }),
            });
            this.reload();
          }
        }
      },
      getFileName(data) {
        if (data.kind) {
          if (data.metadata && data.metadata.name) {
            return `${data.kind.toLocaleLowerCase()}-${data.metadata.name}.yaml`;
          } else {
            return `${data.kind.toLocaleLowerCase()}-${new Date().toJSON()}.yaml`;
          }
        }
      },
      onYamlSwitchChange() {
        if (this.yaml) {
          const data = this.$refs[this.formComponent].getData();
          this.formComponent = 'BaseYamlForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].setYaml(this.$yamldump(data));
          });
        } else {
          const yaml = this.$refs[this.formComponent].getYaml();
          const data = this.$yamlload(yaml);
          const mixinjson = require(`@/views/resource/${
            ['deployment', 'statefulset', 'daemonset'].indexOf(this.kind.toLocaleLowerCase()) > -1
              ? 'workload'
              : this.kind.toLocaleLowerCase()
          }/mixins/schema.js`);
          if (!this.m_resource_validateJsonSchema(mixinjson.default.data().schema, data)) {
            this.yaml = true;
            this.switchKey = randomString(6);
            return;
          }
          this.formComponent = 'AppResourceBaseForm';
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data, true);
          });
        }
      },
      lastStep() {
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
        if (this.step > 0) {
          const data = this.$refs[this.formComponent].getData();
          this.step -= 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].back(data);
          });
        }
      },
      nextStep() {
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
        if (this.step < this.totalStep - 1 && this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          if (
            ['DaemonSet', 'Deployment', 'StatefulSet', 'Job'].indexOf(data.kind) > -1 &&
            this.step === 1 &&
            (!data.spec.template.spec.containers ||
              (data.spec.template.spec.containers && data.spec.template.spec.containers.length === 0))
          ) {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$t('tip.add_container_image'),
              color: 'warning',
            });
            return;
          } else if (
            ['CronJob'].indexOf(data.kind) > -1 &&
            this.step === 1 &&
            (!data.spec.jobTemplate.spec.template.spec.containers ||
              (data.spec.jobTemplate.spec.template.spec.containers &&
                data.spec.jobTemplate.spec.template.spec.containers.length === 0))
          ) {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$t('tip.add_container_image'),
              color: 'warning',
            });
            return;
          }
          this.step += 1;
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      onKindChange(kind, totalStep, init, data) {
        this.kind = kind;
        this.totalStep = totalStep;
        if (init) {
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      init(app) {
        var p = deepCopy(app);
        this.app = Object.assign(p, {
          ApplicationName: p.name,
        });
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
        this.formComponent = 'AppResourceBaseForm';
        this.yaml = false;
      },
    },
  };
</script>
