<template>
  <BaseDialog v-model="dialog" icon="mdi-link" title="关联环境" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="环境定义" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-autocomplete
              v-model="obj.projectid"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_projectItems"
              :label="Admin ? `租户(项目)` : `项目`"
              no-data-text="暂无可选数据"
              :rules="objRules.projectIDRules"
              @focus="onProjectSelectFocus"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
            <v-autocomplete
              v-model="obj.environmentid"
              class="my-0"
              color="primary"
              hide-selected
              :items="m_select_projectEnvironmentItems"
              label="环境"
              no-data-text="暂无可选数据"
              :rules="objRules.environmentIDRules"
              @focus="onProjectEnvironmentSelectFocus(obj.projectid, true)"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addVirtualSpaceEnvironment">
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { postAddVirtualSpaceEnvironment } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { required } from '@/utils/rules';

  export default {
    name: 'AddEnvironment',
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      dialog: false,
      valid: false,
      obj: {
        projectid: null,
        environmentid: null,
      },
      objRules: {
        projectIDRules: [required],
        environmentIDRules: [required],
      },
    }),
    computed: {
      ...mapState(['Circular', 'Admin']),
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async addVirtualSpaceEnvironment() {
        if (this.$refs.form.validate(true)) {
          await postAddVirtualSpaceEnvironment(this.VirtualSpace().ID, {
            VirtualSpaceID: this.VirtualSpace().ID,
            ID: this.obj.environmentid,
          });
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
      onProjectSelectFocus() {
        this.m_select_projectSelectData();
      },
      onProjectEnvironmentSelectFocus(projectid, vs = true) {
        this.m_select_projectEnvironmentSelectData(projectid, vs);
      },
    },
  };
</script>
