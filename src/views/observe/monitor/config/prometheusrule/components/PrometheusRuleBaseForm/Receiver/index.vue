<template>
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="告警消息" />
      <v-card-text class="pa-2">
        <v-textarea v-model="obj.message" auto-grow class="my-0" label="告警消息" required />
      </v-card-text>

      <ReceiverForm
        ref="receiverForm"
        :cluster="obj.cluster"
        :data="obj.receivers"
        :mode="mode"
        :namespace="obj.namespace"
        @addData="addData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="接收器配置" />
      <v-card-text class="pa-2">
        <ReceiverItem
          :receivers="obj.receivers"
          @expandCard="expandCard"
          @removeReceiver="removeReceiver"
          @updateReceiver="updateReceiver"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import ReceiverForm from './ReceiverForm';
  import ReceiverItem from './ReceiverItem';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'Receiver',
    components: {
      ReceiverForm,
      ReceiverItem,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      mode: {
        type: String,
        default: () => 'monitor',
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        obj: {
          receivers: [],
          message: '',
        },
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
    },
    watch: {
      item() {
        this.obj = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) {
        // 如果是更新
        this.obj = this.$_.merge(this.obj, deepCopy(this.item));
        if (this.item.receivers) {
          this.$set(this.obj.receivers, this.item.receivers);
        }
      }
    },
    methods: {
      init(data) {
        this.$nextTick(() => {
          this.obj.receivers = [];
          this.obj = this.$_.merge(this.obj, deepCopy(data));
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      addData(data) {
        this.obj.receivers = data;
        this.$refs.receiverForm.closeCard();
      },
      updateReceiver(index) {
        const receiver = this.obj.receivers[index];
        const data = {
          index: index,
          name: receiver.name,
          interval: receiver.interval,
        };

        this.$nextTick(() => {
          this.$refs.receiverForm.init(data);
          this.expand = true;
        });
      },
      removeReceiver(index) {
        this.$delete(this.obj.receivers, index);
      },
      expandCard() {
        this.$nextTick(() => {
          this.$refs.receiverForm.expandCard();
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      reset() {
        this.$refs.receiverForm.closeCard();
        this.$refs.form.reset();
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
