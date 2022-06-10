<template>
  <v-form ref="form" v-model="valid" lazy-validation class="my-2" @submit.prevent>
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4">
        <v-card-text class="pa-0">
          <BaseSubTitle title="匹配策略" />
          <L4MatchAttributesForm :match="tcp.match" @updateComponentData="updateMatchComponentData" />

          <BaseSubTitle title="路由策略" />
          <RouteDestinationForm :route="tcp.route" @updateComponentData="updateRouteComponentData" />
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn text small color="error" @click="closeCard"> 取消 </v-btn>
          <v-btn text small color="primary" @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
  import RouteDestinationForm from '@/views/microservice/service/components/virtual_service/route/RouteDestinationForm';
  import L4MatchAttributesForm from '@/views/microservice/service/components/virtual_service/match/L4MatchAttributesForm';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'TcpForm',
    components: {
      RouteDestinationForm,
      L4MatchAttributesForm,
    },
    props: {
      data: {
        type: Array,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        tcpCopy: [],
        tcp: {},
      };
    },
    watch: {
      data() {
        this.tcpCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.tcpCopy = deepCopy(this.data);
      }
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      init(data) {
        if (data) {
          this.tcp = deepCopy(data);
        } else {
          this.tcp = {
            index: -1,
            match: [],
            route: [],
          };
        }
        this.expand = true;
      },
      updateMatchComponentData(data) {
        this.tcp.match = data;
      },
      updateRouteComponentData(data) {
        this.tcp.route = data;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          const data = deepCopy(this.tcp);
          delete data['index'];
          if (this.tcp.index === -1) {
            this.tcpCopy.push(data);
          } else {
            this.$set(this.tcpCopy, this.tcp.index, data);
          }
          this.$emit('addData', this.tcpCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.tcp.index = -1;
        this.$emit('closeOverlay');
      },
      // eslint-disable-next-line vue/no-unused-properties
      expandCard() {
        this.expand = true;
      },
    },
  };
</script>
