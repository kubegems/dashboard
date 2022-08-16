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
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('resource.app')])" />
      <v-card-text class="pa-2">
        <v-autocomplete
          v-if="AdminViewport"
          v-model="obj.ProjectID"
          class="my-0"
          color="primary"
          hide-selected
          :items="m_select_projectItems"
          :label="$root.$t('resource.project')"
          :no-data-text="$root.$t('data.no_data')"
          :readonly="edit"
          :rules="objRules.projectRule"
          @change="onProjectChange"
          @focus="onProjectSelectFocus"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              :label="$t('table.name')"
              :readonly="edit"
              required
              :rules="objRules.nameRules"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.kind"
              class="my-0"
              color="primary"
              hide-selected
              :items="kindItems"
              :label="$t('table.kind')"
              :no-data-text="$root.$t('data.no_data')"
              :readonly="edit && obj.kind && obj.kind.length > 0"
              :rules="objRules.kindRule"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-textarea
              v-model="obj.description"
              auto-grow
              class="my-0"
              :label="$t('table.remark')"
              required
              :rules="objRules.descriptionRules"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <component
        :is="formComponent"
        :ref="formComponent"
        :data="obj.Labels"
        @addData="addData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle :title="$t('table.label')" />
      <v-card-text class="pa-2">
        <LabelItem
          :labels="obj.labels"
          @expandCard="expandCard"
          @removeLabels="removeLabels"
          @updateLabels="updateLabels"
        />
        <div class="kubegems__clear-float" />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { k8sLabel, required } from '@/utils/rules';
  import LabelForm from '@/views/resource/components/label/LabelForm';
  import LabelItem from '@/views/resource/components/label/LabelItem';

  export default {
    name: 'AppBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      LabelForm,
      LabelItem,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      obj: {
        name: '',
        kind: '',
        description: '',
        ProjectID: 0,
        TenantID: 0,
        labels: {},
      },
      formComponent: 'LabelForm',
    }),
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Project', 'Tenant']),
      objRules() {
        return {
          nameRules: [required, k8sLabel],
          descriptionRules: [required],
          projectRule: [required],
          kindRule: [required],
        };
      },
      selectProject() {
        const project = this.m_select_projectItems.find((p) => {
          return p.value === this.obj.ProjectID;
        });
        return project;
      },
      kindItems() {
        return [
          { text: this.$root.$t('resource.deployment'), value: 'Deployment' },
          { text: this.$root.$t('resource.statefulset'), value: 'StatefulSet' },
          { text: this.$root.$t('resource.daemonset'), value: 'DaemonSet' },
        ];
      },
    },
    mounted() {
      if (this.AdminViewport) {
        this.m_select_projectSelectData();
      } else {
        this.obj.ProjectID = this.Project().ID;
        this.obj.TenantID = this.Tenant().ID;
      }
    },
    methods: {
      addData(data) {
        this.obj.labels = data;
      },
      removeLabels(key) {
        this.$delete(this.obj.labels, key);
      },
      updateLabels(key) {
        const data = { key: key, value: this.obj.labels[key] };
        this.$refs[this.formComponent].init(data);
      },
      expandCard() {
        this.$refs[this.formComponent].expand = true;
        this.expand = true;
      },
      closeExpand() {
        this.expand = false;
      },
      onProjectChange() {
        if (this.selectProject) {
          this.obj.TenantID = this.selectProject.tenantID;
        }
      },
      checkSaved() {
        if (this.$refs[this.formComponent].expand) {
          return !this.$refs[this.formComponent].expand;
        }
        return true;
      },
      reset() {
        this.$refs[this.formComponent].closeCard();
        this.$refs.form.reset();
      },
      setData(data) {
        this.obj = data;
      },
      getData() {
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      onProjectSelectFocus() {
        this.m_select_projectSelectData();
      },
    },
  };
</script>
