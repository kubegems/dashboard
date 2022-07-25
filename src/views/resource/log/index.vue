<template>
  <ContainerLog ref="containerLog" />
</template>

<script>
  import { getPodDetail } from '@/api';
  import ContainerLog from '@/views/resource/components/common/ContainerLog';

  export default {
    name: 'Log',
    components: {
      ContainerLog,
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
          containers: this.pod.spec.containers.concat(
            this.pod.spec.initContainers.map((i) => {
              return { ...i, showName: `${i.name} (init)` };
            }) || [],
          ),
        };
        let container = this.pod.spec.containers[0].name;
        if (this.$route.query.container) container = this.$route.query.container;
        this.$refs.containerLog.init(container, item);
        this.$refs.containerLog.open();
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
