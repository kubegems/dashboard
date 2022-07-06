<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle title="虚拟空间定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.VirtualSpaceName"
            class="my-0"
            label="空间名称"
            :readonly="edit"
            required
            :rules="objRules.virtualSpaceNameRule"
          />
        </v-col>
        <!-- <v-col cols="2">
          <v-switch v-model="obj.dns" class="mt-4" label="启用DNS"></v-switch>
        </v-col> -->
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'VirtualSpaceBaseInfo',
    mixins: [BaseResource, BaseSelect],
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
        obj: {
          VirtualSpaceName: '',
          Environments: [],
          Users: [],
        },
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      objRules() {
        return {
          virtualSpaceNameRule: [required, (v) => !!(v && v.length <= 20) || '超出20字符限制'],
        };
      },
    },
    watch: {
      item() {
        this.loadData();
      },
    },
    mounted() {
      this.loadData();
    },
    methods: {
      async loadData() {
        this.$nextTick(() => {
          if (this.item) this.obj = deepCopy(this.item);
        });
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
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
