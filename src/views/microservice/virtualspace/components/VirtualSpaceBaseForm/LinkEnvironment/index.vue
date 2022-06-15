<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />

    <LinkEnvironmentForm ref="linkEnvironmentForm" @addData="addData" @closeOverlay="closeExpand" />
    <BaseSubTitle title="关联环境" />
    <v-card-text class="pa-2">
      <EnvironmentItem
        :environments="obj.Environments"
        @expandCard="expandCard"
        @removeEnvironment="removeEnvironment"
        @updateEnvironment="updateEnvironment"
      />
    </v-card-text>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import EnvironmentItem from './EnvironmentItem';
  import LinkEnvironmentForm from './LinkEnvironmentForm';

  import { postAddVirtualSpaceEnvironment, deleteVirtualSpaceEnvironment } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'LinkEnvironment',
    components: {
      EnvironmentItem,
      LinkEnvironmentForm,
    },
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
        expand: false,
        obj: {
          VirtualSpaceName: '',
          Environments: [],
          Users: [],
        },
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
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
        this.$nextTick(() => {});
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      async addData(data) {
        if (data.index === -1) {
          if (this.edit) {
            await postAddVirtualSpaceEnvironment(
              this.obj.ID,
              Object.assign(data, {
                VirtualSpaceID: this.obj.ID,
                ID: data.value,
                EnvironmentName: data.text,
              }),
            );
          }
          this.obj.Environments.push(Object.assign(data, { ID: data.value, EnvironmentName: data.text }));
        } else {
          if (this.edit) {
            await deleteVirtualSpaceEnvironment(this.obj.ID, data.value);
            await postAddVirtualSpaceEnvironment(
              this.obj.ID,
              Object.assign(data, {
                ID: data.value,
                EnvironmentName: data.text,
                VirtualSpaceID: this.obj.ID,
              }),
            );
          }
          this.$set(
            this.obj.Environments,
            data.index,
            Object.assign(data, {
              ID: data.value,
              EnvironmentName: data.text,
            }),
          );
          this.$emit('refresh');
        }
      },
      expandCard() {
        this.$nextTick(() => {
          this.$refs.linkEnvironmentForm.expandCard();
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      updateEnvironment(index) {
        const data = this.obj.Environments[index];
        this.$refs.linkEnvironmentForm.init({
          index: index,
          projectid: data.ProjectID,
          environmentid: data.ID,
        });
        this.$refs.linkEnvironmentForm.expandCard();
        this.expand = true;
      },
      async removeEnvironment(index) {
        if (this.edit) {
          const env = this.obj.Environments[index];
          await deleteVirtualSpaceEnvironment(this.obj.ID, env.ID);
        }
        this.$delete(this.obj.Environments, index);
        this.$emit('refresh');
      },

      // eslint-disable-next-line vue/no-unused-properties
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
