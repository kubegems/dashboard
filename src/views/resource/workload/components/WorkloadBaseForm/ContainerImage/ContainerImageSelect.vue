<template>
  <v-form ref="form" v-model="valid" lazy-validation class="mb-2" @submit.prevent>
    <v-sheet class="pt-2 px-2">
      <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
        <span>镜像定义</span>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__long-width">
        <v-text-field v-model="obj.image" class="my-0" required label="镜像地址" :rules="objRules.imageRule" />
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
        <span />
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field v-model="obj.name" required label="容器名称" :readonly="edit" :rules="objRules.nameRule" />
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="containerType"
          :items="containerTypes"
          :rules="objRules.containerTypeRule"
          color="primary"
          label="容器类型"
          hide-selected
          no-data-text="暂无可选数据"
          :readonly="edit"
          @change="onContainerTypeChange"
        >
          <template #selection="{ item }">
            <v-chip color="primary" small class="mx-1">
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
        <span />
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="imageRegistry"
          :items="m_select_registryItems"
          color="primary"
          label="镜像密钥"
          hide-selected
          item-text="value"
          no-data-text="暂无可选数据"
          @focus="onRegistrySelectFocus"
          @change="onRegistryChange"
        >
          <template #selection="{ item }">
            <v-chip color="primary" small class="mx-1">
              {{ item['value'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="obj.imagePullPolicy"
          :items="imagePullPolicys"
          :rules="objRules.imagePullPolicyRule"
          color="primary"
          label="镜像策略"
          hide-selected
          no-data-text="暂无可选数据"
        >
          <template #selection="{ item }">
            <v-chip color="primary" small class="mx-1">
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
  </v-form>
</template>

<script>
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ContainerImageSelect',
    mixins: [BaseSelect],
    props: {
      container: {
        type: Object,
        default: () => null,
      },
      type: {
        type: String,
        default: () => 'worker',
      },
      imagePullSecret: {
        type: String,
        default: () => 'default',
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        valid: false,
        containerTypes: [
          { text: '工作容器', value: 'worker' },
          { text: '初始化容器', value: 'init' },
        ],
        containerType: 'worker',
        imagePullPolicys: [
          { text: '尝试重新下载镜像', value: 'Always' },
          { text: '优先使用本地镜', value: 'IfNotPresent' },
          { text: '仅使用本地镜像', value: 'Never' },
        ],
        imageRegistry: '',
        obj: {
          name: '',
          imagePullPolicy: 'IfNotPresent',
          image: '',
        },
        objRules: {
          imageRule: [required],
          nameRule: [required],
          imagePullPolicyRule: [required],
          containerTypeRule: [required],
        },
      };
    },
    watch: {
      container: {
        handler() {
          this.init();
        },
        deep: true,
      },
      imagePullSecret() {
        this.imageRegistry = this.imagePullSecret;
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.m_select_registrySelectData();
      });
    },
    methods: {
      init() {
        if (!this.container) {
          this.$refs.form.resetValidation();
          this.containerType = 'worker';
          this.obj = deepCopy(this.$options.data().obj);
        } else {
          this.obj = this.$_.mergeWith(this.obj, deepCopy(this.container), (objValue, srcValue) => {
            if (this.$_.isArray(objValue)) {
              return srcValue;
            }
          });
        }
        this.containerType = this.type;
      },
      onContainerTypeChange() {
        this.$emit('updateType', this.containerType);
      },
      onRegistryChange() {
        this.$emit('updateRegistry', this.imageRegistry);
      },
      // eslint-disable-next-line vue/no-unused-properties
      reset() {
        this.$refs.form.resetValidation();
        this.containerType = 'worker';
        this.obj = deepCopy(this.$options.data().obj);
      },
      onRegistrySelectFocus() {
        this.m_select_registrySelectData();
      },
      // eslint-disable-next-line vue/no-unused-properties
      validate() {
        return this.$refs.form.validate(true);
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        return this.obj;
      },
    },
  };
</script>
