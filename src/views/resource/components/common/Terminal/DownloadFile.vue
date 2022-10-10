<template>
  <v-menu v-model="menu" :position-x="left" :position-y="top">
    <v-card>
      <v-card-text class="pa-2">
        <v-flex>
          <v-btn color="error" small text @click="download">
            {{ $root.$t('operate.download') }}
          </v-btn>
        </v-flex>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'DownloadFile',
    props: {
      file: {
        type: String,
        default: '',
      },
      left: {
        type: Number,
        default: 0,
      },
      top: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        menu: false,
      };
    },
    computed: {
      ...mapState(['JWT']),
    },
    watch: {
      left: {
        handler(newValue) {
          if (newValue) {
            this.menu = true;
          }
        },
        deep: true,
      },
    },
    methods: {
      async download() {
        window.open(
          `/api/v1/proxy/cluster/${this.$route.query.t_cluster}/custom/core/v1/namespaces/${this.$route.query.t_namespace}/pods/${this.$route.query.t_pod}/actions/file?filename=${this.file}&token=${this.JWT}`,
        );
      },
    },
  };
</script>
