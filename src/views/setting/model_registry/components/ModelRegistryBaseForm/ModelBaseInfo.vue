<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle title="模型商店定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="registry"
            class="my-0"
            color="primary"
            hide-selected
            :items="registryItems"
            label="模型商店来源"
            no-data-text="暂无可选数据"
            :rules="objRules.registryRules"
            @change="onRegistryChange"
          />
        </v-col>
        <template v-if="registry === 'modelx'">
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              label="商店名称"
              :readonly="edit"
              required
              :rules="objRules.nameRules"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field class="my-0" label="商店地址" required />
          </v-col>
        </template>
        <v-col cols="6">
          <v-autocomplete
            class="my-0"
            color="primary"
            label="默认镜像"
            no-data-text="暂无可选数据"
            :rules="objRules.imageRules"
          />
        </v-col>
        <template v-if="registry === 'modelx'">
          <v-col cols="6">
            <v-switch class="mt-6" label="允许模型创建" />
          </v-col>
        </template>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ModelBaseInfo',
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        registry: '',
        registryItems: [
          { text: 'huggingface', value: 'huggingface' },
          { text: 'openmmlab', value: 'openmmlab' },
          { text: 'tensorflow', value: 'tensorflow' },
          { text: 'pytorch', value: 'pytorch' },
          { text: 'modelx', value: 'modelx' },
        ],
        obj: {
          name: '',
        },
        objRules: {
          nameRules: [required],
          registryRules: [required],
          imageRules: [required],
        },
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            if (
              this.registryItems.some((r) => {
                return r.value === this.obj.name;
              })
            ) {
              this.registry = this.obj.name;
            } else {
              this.registry = 'modelx';
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = this.$_.merge(this.obj, deepCopy(data));
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      onRegistryChange() {
        if (this.registry !== 'modelx') {
          this.obj.name = this.registry;
        }
      },
    },
  };
</script>
