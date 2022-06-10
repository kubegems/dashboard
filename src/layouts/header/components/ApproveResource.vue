<template>
  <BaseDialog v-model="dialog" :width="1000" title="资源调整" icon="mdi-scale" @reset="reset">
    <template #content>
      <ResourceBaseForm ref="resource" :quota="quota" :cluster="cluster" edit />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="passLoading" @click="approvePass"> 通过 </v-btn>
      <v-btn class="float-right" color="error" text :loading="cancelLoading" @click="approveReject"> 拒绝 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';
  import { postApprovePass, postApproveReject, getTenantResourceQuota } from '@/api';
  import ResourceBaseForm from '@/views/tenant/tenant/components/ResourceList/ResourceBaseForm';
  import BaseResource from '@/mixins/resource';
  import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'ApproveResource',
    components: {
      ResourceBaseForm,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      item: null,
      quota: null,
      cluster: '',
      passLoading: false,
      cancelLoading: false,
    }),
    computed: {
      ...mapState(['Circular']),
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.cluster = newValue?.Cluster?.ClusterName;
          }
        },
        deep: true,
      },
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async approvePass() {
        if (this.$refs.resource.validate()) {
          this.passLoading = true;
          const data = {
            Content: {},
          };
          const obj = this.$refs.resource.getData();
          data.Content['limits.cpu'] = `${obj.Content['limits.cpu']}`;
          data.Content['limits.memory'] = `${obj.Content['limits.memory']}Gi`;
          data.Content[`requests.storage`] = `${obj.Content[`requests.storage`]}Gi`;
          await postApprovePass(this.item.ID, data);
          this.passLoading = false;
          this.reset();
          this.$emit('refresh');
        }
      },
      async approveReject() {
        this.cancelLoading = true;
        await postApproveReject(this.item.ID);
        this.cancelLoading = false;
        this.reset();
        this.$emit('refresh');
      },
      // eslint-disable-next-line vue/no-unused-properties
      async init(item) {
        this.item = deepCopy(item);
        const data = await getTenantResourceQuota(this.item.ClusterName, this.item.TenantName, {
          noprocessing: true,
        });
        this.item.NowCpu = parseFloat(sizeOfCpu(data.spec.hard['limits.cpu']));
        this.item.NowMemory = parseFloat(sizeOfStorage(data.spec.hard['limits.memory']));
        this.item.NowStorage = parseFloat(sizeOfStorage(data.spec.hard[`requests.storage`]));
        if (item.NvidiaGpu) {
          this.item.NowNvidiaGpu = data.spec.hard['limits.nvidia.com/gpu'];
        }
        if (item.TkeGpu) {
          this.item.NowTkeGpu = data.spec.hard['tencent.com/vcuda-core'];
        }
        if (item.TkeMemory) {
          this.item.NowTkeMemory = data.spec.hard['tencent.com/vcuda-memory'];
        }
        this.quota = await this.m_resource_clusterQuota(this.item.ClusterID, this.item);
        const content = {
          'limits.cpu': this.item.Content[`limits.cpu`],
          'limits.memory': this.item.Content[`limits.memory`].replaceAll('Gi', ''),
          'requests.storage': this.item.Content[`requests.storage`].replaceAll('Gi', ''),
        };
        if (item.NvidiaGpu) {
          content['limits.nvidia.com/gpu'] = this.item.Content[`limits.nvidia.com/gpu`];
        }
        if (item.TkeGpu) {
          content['tencent.com/vcuda-core'] = this.item.Content[`tencent.com/vcuda-core`];
        }
        if (item.TkeMemory) {
          content['tencent.com/vcuda-memory'] = this.item.Content[`tencent.com/vcuda-memory`];
        }
        this.$refs.resource.setContent(content);
      },
      reset() {
        this.dialog = false;
        this.$refs.resource.reset();
        this.quota = null;
      },
    },
  };
</script>
