<template>
  <div>
    <BaseSubTitle title="loki配置" />
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-row class="px-2 mt-0">
        <v-col cols="6">
          <v-text-field v-model="obj.spec.loki.url" class="my-0" label="url" required :rules="objRules.urlRules" />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
  import { required } from '@/utils/rules';

  export default {
    name: 'Loki',
    props: {
      item: {
        type: Object,
        default: null,
      },
    },
    data() {
      this.obj = {
        spec: {
          loki: {
            url: '',
            labels: {
              container: '$.kubernetes.container_name',
              image: '$.kubernetes.container_image',
              namespace: '$.kubernetes.namespace_name',
              node: '$.kubernetes.host',
              pod: '$.kubernetes.pod_name',
              stream: '$.stream',
            },
            extra_labels: {
              cluster: this.$route?.query.cluster,
            },
            extract_kubernetes_labels: true,
            remove_keys: ['logtag', 'kubernetes', 'docker', 'time', 'throttle_group_key'],
            drop_single_key: true,
            configure_kubernetes_labels: false,
            buffer: {
              tags: 'time',
              total_limit_size: '10G',
              flush_mode: 'interval',
              flush_interval: '1s',
              flush_thread_count: 4,
              timekey: '1m',
              timekey_wait: '5s',
            },
          },
        },
      };

      return {
        valid: false,
        objRules: {
          urlRules: [required],
        },
      };
    },
    mounted() {
      this.$nextTick(() => {
        this.$refs.form.resetValidation();
        if (this.item?.spec?.loki) {
          this.obj = this.$_.merge(this.item, this.obj);
        }
      });
    },
    methods: {
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
