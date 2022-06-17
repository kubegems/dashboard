<template>
  <BaseDialog v-model="dialog" icon="mdi-tag-plus" title="添加污点" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="污点信息" />
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field v-model="obj.key" class="my-0" label="键" required :rules="objRules.keyRules" />
            <v-text-field v-model="obj.value" class="my-0" label="值" required :rules="objRules.valueRules" />
            <v-autocomplete
              v-model="obj.effect"
              class="my-0"
              color="primary"
              hide-selected
              :items="effectSelect"
              label="策略"
              no-data-text="暂无可选数据"
              :rules="objRules.effectRules"
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
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addTaint"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { patchTaintNode } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'AddTaint',
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      valid: false,
      effectSelect: [
        { text: '不允许调度 (NoSchedule)', value: 'NoSchedule' },
        { text: '尽量不调度 (PreferNoSchedule)', value: 'PreferNoSchedule' },
        { text: '不允许并驱逐已有容器组 (NoExecute)', value: 'NoExecute' },
      ],
      item: null,
      obj: {
        key: '',
        value: '',
        effect: '',
      },
      objRules: {
        keyRules: [required],
        valueRules: [required],
        effectRules: [required],
      },
      taints: [],
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addTaint() {
        this.taints = deepCopy(this.item.spec.taints ? this.item.spec.taints : []);
        if (this.$refs.form.validate(true)) {
          this.taints.push(this.obj);
          await patchTaintNode(this.ThisCluster, this.item.metadata.name, {
            Taints: this.taints,
          });
          this.$emit('refresh');
          this.reset();
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
        this.taints = [];
      },
      setItem(data) {
        this.item = data;
      },
    },
  };
</script>
