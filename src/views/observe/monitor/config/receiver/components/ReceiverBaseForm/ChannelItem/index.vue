<template>
  <v-flex>
    <v-sheet v-for="(item, index) in items" :key="index" class="grey lighten-4 rounded mb-3">
      <components :is="itemMap[item.type]" :item="item" @removeConfig="removeConfig" @updateConfig="updateConfig" />
    </v-sheet>
    <v-flex>
      <v-flex class="grey lighten-4 rounded">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-subtitle class="text-body-2 py-0 text-center">
              <v-btn color="primary" text @click="expandCard">
                <v-icon left small> mdi-plus </v-icon>
                添加告警渠道
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </v-flex>
  </v-flex>
</template>

<script>
  import EmailItem from './EmailItem';
  import WebhookItem from './WebhookItem';

  export default {
    name: 'ChannelItem',
    components: {
      EmailItem,
      WebhookItem,
    },
    props: {
      obj: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      itemMap: { Email: 'EmailItem', Webhook: 'WebhookItem' },
    }),
    computed: {
      items() {
        let arr = [];
        if (this.obj.emailConfigs) {
          arr = arr.concat(
            this.obj.emailConfigs.map((item, index) => {
              return { ...item, type: 'Email', index: index };
            }),
          );
        }
        if (this.obj.webhookConfigs) {
          arr = arr.concat(
            this.obj.webhookConfigs.map((item, index) => {
              return { ...item, type: 'Webhook', index: index };
            }),
          );
        }
        return arr;
      },
    },
    methods: {
      updateConfig(type, index) {
        this.$emit('updateConfig', type, index);
      },
      removeConfig(type, index) {
        this.$emit('removeConfig', type, index);
      },
      expandCard() {
        this.$emit('expandCard', 'channelForm');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .white-space {
    white-space: normal;
  }
</style>
>
