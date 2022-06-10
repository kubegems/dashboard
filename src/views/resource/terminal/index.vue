<template>
  <Terminal ref="terminal" />
</template>

<script>
  import { getPodDetail } from '@/api';
  import Terminal from '@/views/resource/components/common/Terminal';

  export default {
    name: 'Console',
    components: {
      Terminal,
    },
    data() {
      return {
        pod: null,
      };
    },
    mounted() {
      this.$nextTick(async () => {
        await this.podDetail();
        const item = {
          namespace: this.$route.query.namespace,
          name: this.$route.params.name,
          containers: this.pod.spec.containers,
        };
        let container = this.pod.spec.containers[0].name;
        if (this.$route.query.container) container = this.$route.query.container;
        this.$refs.terminal.init(container, item, this.$route.query.type);
        this.$refs.terminal.open();
      });
    },
    methods: {
      async podDetail() {
        const data = await getPodDetail(
          this.$route.query.cluster,
          this.$route.query.namespace,
          this.$route.params.name,
        );
        this.pod = data;
      },
    },
  };
</script>
