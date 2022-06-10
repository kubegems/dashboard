<template>
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="应用定义" />
      <v-card-text class="pa-2">
        <v-autocomplete
          v-if="AdminViewport"
          v-model="obj.ProjectID"
          color="primary"
          :items="m_select_projectItems"
          :rules="objRules.projectRule"
          label="项目"
          hide-selected
          class="my-0"
          no-data-text="暂无可选数据"
          :readonly="edit"
          @focus="onProjectSelectFocus"
          @change="onProjectChange"
        >
          <template #selection="{ item }">
            <v-chip color="primary" small class="mx-1">
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              :rules="objRules.nameRules"
              required
              label="名称"
              :readonly="edit"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.kind"
              color="primary"
              :items="kindItems"
              :rules="objRules.kindRule"
              label="应用类型"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              :readonly="edit && obj.kind && obj.kind.length > 0"
            >
              <template #selection="{ item }">
                <v-chip color="primary" small class="mx-1">
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
              class="my-0"
              :rules="objRules.descriptionRules"
              auto-grow
              required
              label="说明"
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
      <BaseSubTitle title="标签" />
      <v-card-text class="pa-2">
        <LabelItem
          :labels="obj.labels"
          @updateLabels="updateLabels"
          @removeLabels="removeLabels"
          @expandCard="expandCard"
        />
        <div class="kubegems__clear-float" />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import LabelItem from '@/views/resource/components/label/LabelItem';
  import LabelForm from '@/views/resource/components/label/LabelForm';
  import BaseSelect from '@/mixins/select';
  import BaseResource from '@/mixins/resource';
  import { k8sLabel, required } from '@/utils/rules';

  export default {
    name: 'AppBaseForm',
    components: { LabelItem, LabelForm },
    mixins: [BaseSelect, BaseResource],
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      kindItems: [
        { text: '无状态服务', value: 'Deployment' },
        { text: '有状态服务', value: 'StatefulSet' },
        { text: '守护进程服务', value: 'DaemonSet' },
      ],
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
      // eslint-disable-next-line vue/no-unused-properties
      checkSaved() {
        if (this.$refs[this.formComponent].expand) {
          return !this.$refs[this.formComponent].expand;
        }
        return true;
      },
      // eslint-disable-next-line vue/no-unused-properties
      reset() {
        this.$refs[this.formComponent].closeCard();
        this.$refs.form.reset();
      },
      // eslint-disable-next-line vue/no-unused-properties
      setData(data) {
        this.obj = data;
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        return this.obj;
      },
      // eslint-disable-next-line vue/no-unused-properties
      validate() {
        return this.$refs.form.validate(true);
      },
      onProjectSelectFocus() {
        this.m_select_projectSelectData();
      },
    },
  };
</script>
