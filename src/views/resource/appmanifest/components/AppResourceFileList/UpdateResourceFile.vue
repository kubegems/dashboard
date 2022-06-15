<template>
  <BaseDialog v-model="dialog" icon="mdi-wrench" title="更新资源文件" :width="1000" @reset="reset">
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :app="app"
        :edit="true"
        :item="item"
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
        @click="updateResourceFile"
      >
        确定
      </v-btn>
      <v-btn
        v-if="step >= 0 && step < totalStep - 1 && formComponent !== 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="nextStep"
      >
        下一步
      </v-btn>
      <v-btn
        v-if="step > 0 && step <= totalStep - 1 && formComponent !== 'BaseYamlForm'"
        class="float-right mx-2"
        color="primary"
        text
        @click="lastStep"
      >
        上一步
      </v-btn>
    </template>
    <template #header-action>
      <v-switch
        :key="switchKey"
        v-model="yaml"
        class="ma-0 pl-2 ml-2 mt-1"
        color="white"
        hide-details
        style="margin-top: 8px !important"
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

  import AppResourceBaseForm from './AppResourceBaseForm';

  import { patchAppResourceFile } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy, randomString } from '@/utils/helpers';

  export default {
    name: 'UpdateResourceFile',
    components: {
      AppResourceBaseForm,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      yaml: false,
      formComponent: 'AppResourceBaseForm',
      kind: '',
      step: 0,
      totalStep: 1,
      app: null,
      item: null,
      file: null,
      switchKey: '',
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateResourceFile() {
        if (this.$refs[this.formComponent].validate()) {
          let data = '';
          if (this.formComponent === 'BaseYamlForm') {
            data = this.$refs[this.formComponent].getYaml();
            const jsondata = this.$yamlload(data);
            if (this.kind) {
              const mixinjson = require(`@/views/resource/${
                ['deployment', 'statefulset', 'daemonset'].indexOf(this.kind.toLowerCase()) > -1
                  ? 'workload'
                  : this.kind.toLowerCase()
              }/mixins/schema.js`);
              if (!this.m_resource_validateJsonSchema(mixinjson.default.data().schema, jsondata)) {
                return;
              }
            }
            data = this.$yamldump(this.m_resource_beautifyData(jsondata));
          } else if (this.formComponent === 'AppResourceBaseForm') {
            data = this.$refs[this.formComponent].getData();
            data = this.$yamldump(this.m_resource_beautifyData(data));
          }
          await patchAppResourceFile(
            this.app.TenantID,
            this.app.ProjectID,
            this.ThisAppEnvironmentID,
            this.app.name,
            this.file.name,
            {
              content: data,
            },
          );
          this.reset();
          this.$emit('refresh');
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
          const yaml = this.$refs[this.formComponent].kubeyaml;
          const data = this.$yamlload(yaml);
          if (this.kind) {
            const mixinjson = require(`@/views/resource/${
              ['deployment', 'statefulset', 'daemonset'].indexOf(this.kind.toLowerCase()) > -1
                ? 'workload'
                : this.kind.toLowerCase()
            }/mixins/schema.js`);
            if (!this.m_resource_validateJsonSchema(mixinjson.default.data().schema, data)) {
              this.yaml = true;
              this.switchKey = randomString(6);
              return;
            }
          } else {
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
            text: '请保存数据',
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
            text: '请保存数据',
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
              text: '请添加容器镜像',
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
              text: '请添加容器镜像',
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
        this.item = deepCopy(data);
        this.totalStep = totalStep;
        if (init) {
          this.$nextTick(() => {
            this.$refs[this.formComponent].init(data);
          });
        }
      },
      init(app, file) {
        this.formComponent = 'AppResourceBaseForm';
        this.app = deepCopy(app);
        this.file = deepCopy(file);
        this.item = deepCopy(this.$yamlload(file.manifest));
        if (!this.$APP_MENIFEST_TAG[this.item?.kind]?.form) {
          this.$store.commit('SET_SNACKBAR', {
            text: '暂时不支持该资源类型，请直接编辑yaml文件',
            color: 'warning',
          });
          this.yaml = true;
          this.formComponent = 'BaseYamlForm';
        }
        this.$nextTick(() => {
          if (this.formComponent === 'BaseYamlForm') {
            this.$refs[this.formComponent].setYaml(file.manifest);
          } else {
            this.$refs[this.formComponent].init(this.item, true);
          }
        });
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
        this.step = 0;
        this.formComponent = '';
        this.yaml = false;
      },
    },
  };
</script>
