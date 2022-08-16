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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <BaseSubTitle :title="$t('tip.image')" />
          <ContainerImageSelect
            ref="containerImageSelect"
            :container="container"
            :edit="containerEdit"
            :image-pull-secret="imagePullSecret"
            :type="type"
            @updateComponentData="updateComponentData"
            @updateRegistry="updateRegistry"
            @updateType="updateType"
          />
          <BaseSubTitle :title="$t('tip.advanced_setting')" />
          <v-tabs v-model="tab" class="px-2 rounded-t mt-2 mb-3" height="30" @change="onTabChange">
            <v-tab v-for="item in tabItems" :key="item.value">
              {{ item.text }}
            </v-tab>
          </v-tabs>

          <component
            :is="tabItems[tab].value"
            :ref="tabItems[tab].value"
            :container="container"
            :namespace="obj.metadata.namespace"
            @updateComponentData="updateComponentData"
          />
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ $root.$t('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ $root.$t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>

    <BaseSubTitle :title="$t('tip.container_image')" />
    <v-card-text class="pa-2">
      <ContainerImageItem
        :containers="obj.spec.jobTemplate.spec.template.spec.containers"
        :init-containers="obj.spec.jobTemplate.spec.template.spec.initContainers"
        @expandCard="expandCard"
        @removeData="removeData"
        @updateData="updateData"
      />
    </v-card-text>
  </v-form>
</template>

<script>
  import messages from '../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import ContainerEnv from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage/container_section/ContainerEnv';
  import ContainerHealthCheck from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage/container_section/ContainerHealthCheck';
  import ContainerPort from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage/container_section/ContainerPort';
  import ContainerResource from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage/container_section/ContainerResource';
  import ContainerRunCommand from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage/container_section/ContainerRunCommand';
  import ContainerSecurityContext from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage/container_section/ContainerSecurityContext';
  import ContainerImageItem from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage/ContainerImageItem';
  import ContainerImageSelect from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage/ContainerImageSelect';

  export default {
    name: 'ContainerImage',
    i18n: {
      messages: messages,
    },
    components: {
      ContainerEnv,
      ContainerHealthCheck,
      ContainerImageItem,
      ContainerImageSelect,
      ContainerPort,
      ContainerResource,
      ContainerRunCommand,
      ContainerSecurityContext,
    },
    data() {
      return {
        valid: false,
        obj: {
          metadata: {},
          spec: {
            jobTemplate: {
              spec: {
                template: {
                  spec: {
                    containers: [],
                    initContainers: [],
                  },
                },
              },
            },
          },
        },
        expand: false,
        container: null,
        type: 'worker',
        imagePullSecret: 'dockerhub',
        containerEdit: false,
        tab: 0,
      };
    },
    computed: {
      tabItems() {
        return [
          { text: this.$t('tab.resource_limit'), value: 'ContainerResource' },
          { text: this.$t('tab.container_port'), value: 'ContainerPort' },
          { text: this.$t('tab.health_check'), value: 'ContainerHealthCheck' },
          { text: this.$t('tab.run_command'), value: 'ContainerRunCommand' },
          { text: this.$t('tab.env'), value: 'ContainerEnv' },
          { text: this.$t('tab.security'), value: 'ContainerSecurityContext' },
        ];
      },
    },
    methods: {
      init(data) {
        this.$nextTick(() => {
          this.obj = this.$_.merge(deepCopy(data), this.obj);
          if (
            this.obj.spec.jobTemplate.spec.template.spec.imagePullSecrets &&
            this.obj.spec.jobTemplate.spec.template.spec.imagePullSecrets.length > 0
          ) {
            this.imagePullSecret = this.obj.spec.jobTemplate.spec.template.spec.imagePullSecrets[0].name;
          }
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      reset() {
        this.$refs.form.reset();
      },
      onTabChange() {
        this.checkData();
      },
      expandCard(edit = false) {
        this.containerEdit = edit;
        if (!edit) {
          this.container = null;
        } else {
          this.$refs.containerImageSelect.init();
        }
        const tabsSliderWrapper = document.querySelector('.v-tabs-slider-wrapper');
        tabsSliderWrapper.style.width = `154px`;
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.$refs.containerImageSelect.reset();
        this.reset();
      },
      generateImagePullSecret() {
        if (this.imagePullSecret === 'dockerhub') {
          this.$delete(this.obj.spec.jobTemplate.spec.template.spec, 'imagePullSecrets');
        } else {
          if (this.obj.spec.jobTemplate.spec.template.spec.imagePullSecrets) {
            const index = this.obj.spec.jobTemplate.spec.template.spec.imagePullSecrets.findIndex((i) => {
              return i.name === this.imagePullSecret;
            });
            if (index === -1) {
              const secrets = this.obj.spec.jobTemplate.spec.template.spec.imagePullSecrets;
              secrets.push({ name: this.imagePullSecret });
              this.$set(this.obj.spec.jobTemplate.spec.template.spec, 'imagePullSecrets', secrets);
            }
          } else {
            this.$set(this.obj.spec.jobTemplate.spec.template.spec, 'imagePullSecrets', [
              { name: this.imagePullSecret },
            ]);
          }
        }
      },
      checkData() {
        let check = true;
        this.tabItems.forEach((tab) => {
          if (this.$refs[tab.value]) {
            if (this.$refs[tab.value].expand) {
              if (tab.value === 'ContainerResource') {
                this.$store.commit('SET_SNACKBAR', {
                  text: this.$t('tip.resource_limit_unsaved'),
                  color: 'warning',
                });
                check = false;
                return;
              } else if (tab.value === 'ContainerPort') {
                this.$store.commit('SET_SNACKBAR', {
                  text: this.$t('tip.container_port_unsaved'),
                  color: 'warning',
                });
                check = false;
                return;
              } else if (tab.value === 'ContainerHealthCheck') {
                this.$store.commit('SET_SNACKBAR', {
                  text: this.$t('tip.health_check_unsaved'),
                  color: 'warning',
                });
                check = false;
                return;
              } else if (tab.value === 'ContainerRunCommand') {
                this.$store.commit('SET_SNACKBAR', {
                  text: this.$t('tip.run_command_unsaved'),
                  color: 'warning',
                });
                check = false;
                return;
              } else if (tab.value === 'ContainerEnv') {
                this.$store.commit('SET_SNACKBAR', {
                  text: this.$t('tip.env_unsaved'),
                  color: 'warning',
                });
                check = false;
                return;
              } else if (tab.value === 'ContainerSecurityContext') {
                this.$store.commit('SET_SNACKBAR', {
                  text: this.$t('tip.security_unsaved'),
                  color: 'warning',
                });
                check = false;
                return;
              }
            }
          }
        });
        return check;
      },
      addData() {
        if (this.checkData()) {
          if (this.$refs.containerImageSelect.validate()) {
            this.updateComponentData(this.$refs.containerImageSelect.getData(), false);
            this.closeCard();
          }
        }
      },
      updateData(index, type) {
        let container = null;
        if (type === 'worker') {
          container = this.obj.spec.jobTemplate.spec.template.spec.containers[index];
          this.type = 'worker';
        } else {
          container = this.obj.spec.jobTemplate.spec.template.spec.initContainers[index];
          this.type = 'init';
        }
        this.container = container;
        this.expandCard(true);
      },
      removeData(index, type) {
        if (type === 'worker') {
          this.$delete(this.obj.spec.jobTemplate.spec.template.spec.containers, index);
        } else {
          this.$delete(this.obj.spec.jobTemplate.spec.template.spec.initContainers, index);
        }
      },
      updateType(data) {
        this.type = data;
      },
      updateRegistry(data) {
        this.imagePullSecret = data;
      },
      updateComponentData(data, temp = true) {
        if (this.type === 'worker') {
          const indexContainer = this.obj.spec.jobTemplate.spec.template.spec.containers.findIndex((c) => {
            return c.name === data.name;
          });
          if (indexContainer > -1) {
            this.container = deepCopy(data);
            if (!temp) {
              this.$set(this.obj.spec.jobTemplate.spec.template.spec.containers, indexContainer, data);
            }
          } else {
            this.container = deepCopy(data);
            if (!temp) {
              const containers = this.obj.spec.jobTemplate.spec.template.spec.containers;
              containers.push(deepCopy(data));
              this.$set(this.obj.spec.jobTemplate.spec.template.spec, 'containers', containers);
            }
          }
        } else if (this.type === 'init') {
          if (!this.obj.spec.jobTemplate.spec.template.spec.initContainers) {
            this.$set(this.obj.spec.jobTemplate.spec.template.spec, 'initContainers', []);
          }
          const indexInitContainer = this.obj.spec.jobTemplate.spec.template.spec.initContainers.findIndex((c) => {
            return c.name === data.name;
          });
          if (indexInitContainer > -1) {
            this.container = deepCopy(data);
            if (!temp) {
              this.$set(this.obj.spec.jobTemplate.spec.template.spec.initContainers, indexInitContainer, data);
            }
          } else {
            this.container = deepCopy(data);
            if (!temp) {
              const containers = this.obj.spec.jobTemplate.spec.template.spec.initContainers;
              containers.push(deepCopy(data));
              this.$set(this.obj.spec.jobTemplate.spec.template.spec, 'initContainers', containers);
            }
          }
        }
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      checkSaved() {
        if (Object.prototype.hasOwnProperty.call(this, 'expand')) {
          return !this.expand;
        }
        return true;
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
