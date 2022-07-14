<template>
  <BaseDialog v-model="dialog" icon="mdi-tag-plus" :title="title" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="标签定义" />
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field v-model="obj.key" class="my-0" label="键" required :rules="objRules.keyRule" />
            <v-text-field v-model="obj.value" class="my-0" label="值" required :rules="objRules.valueRule" />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addLabel"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { patchMetadataNode } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { k8sLabel, k8sName, required } from '@/utils/rules';

  export default {
    name: 'AddLabel',
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      title: {
        type: String,
        default: () => '添加标签',
      },
    },
    data: () => ({
      dialog: false,
      valid: false,
      metadata: null,
      resource: null,
      obj: {
        key: '',
        value: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          keyRule: [required, k8sName],
          valueRule: [required, k8sLabel],
        };
      },
    },
    watch: {
      item() {
        this.metadata = this.item.metadata;
        this.resource = this.item;
      },
    },
    mounted() {
      if (this.item) {
        this.metadata = this.item.metadata;
        this.resource = this.item;
      }
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addLabel() {
        if (this.$refs.form.validate(true)) {
          this.metadata.labels[this.obj.key] = this.obj.value;
          await patchMetadataNode(this.ThisCluster, this.resource.metadata.name, {
            Annotations: this.metadata.annotations,
            Labels: this.metadata.labels,
          });
          this.$emit('refresh', this.obj, 'label');
          this.reset();
        }
      },
      init(item) {
        this.metadata = item.metadata;
        this.resource = item;
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
