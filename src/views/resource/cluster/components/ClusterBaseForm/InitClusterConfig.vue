<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle title="集群初始化设置" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col v-if="!control && !edit && obj.extend.existInstaller" cols="12">
          <v-switch v-model="obj.Primary" class="mt-5" label="控制集群" @change="onPrimaryChange" />
        </v-col>
        <v-col v-if="!obj.Primary" cols="6">
          <v-text-field
            v-model="obj.ClusterName"
            label="集群名称"
            :readonly="edit"
            required
            :rules="objRules.ClusterNameRules"
          />
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.ImageRepo"
            color="primary"
            hide-selected
            :items="imageRepoItems"
            label="镜像仓库"
            no-data-text="暂无可选数据"
            :rules="objRules.ImageRepoRules"
            :search-input.sync="imageRepoText"
            @keyup.enter="createImageRepo"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.DefaultStorageClass"
            color="primary"
            hide-selected
            :items="storageClassItems"
            label="存储卷类型"
            no-data-text="暂无可选数据"
            :rules="objRules.StorageClassesRules"
            :search-input.sync="storageClassText"
            @keyup.enter="createStorageClass"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'InitClusterConfig',
    props: {
      control: {
        type: Boolean,
        default: () => false,
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      valid: false,
      obj: {
        ClusterID: 0,
        ClusterName: '',
        KubeConfig: '',
        Primary: false,
        Vendor: 'selfhosted',
        ImageRepo: 'registry.cn-beijing.aliyuncs.com/kubegems',
        DefaultStorageClass: 'local-path',
        extend: {
          storageClasses: [],
          imageRepos: ['registry.cn-beijing.aliyuncs.com/kubegems', 'docker.io/kubegems'],
          validate: 'progressing',
          clusterName: '',
          existInstaller: false,
        },
      },
      objRules: {
        ClusterNameRules: [required],
        ImageRepoRules: [required],
        StorageClassesRules: [required],
      },
      storageClassText: '',
      imageRepoText: '',
    }),
    computed: {
      storageClassItems() {
        return this.obj.extend.storageClasses.map((sc) => {
          return { value: sc, text: sc };
        });
      },
      imageRepoItems() {
        return this.obj.extend.imageRepos.map((repo) => {
          return { value: repo, text: repo };
        });
      },
    },
    methods: {
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
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      getData() {
        return this.obj;
      },
      getExtend() {
        return this.obj.extend;
      },
      async onPrimaryChange() {
        if (this.obj.Primary) {
          this.obj.ClusterName = this.obj.extend.clusterName;
        } else {
          this.obj.ClusterName = '';
        }
      },
      createStorageClass() {
        const index = this.storageClassItems.findIndex((sc) => {
          return sc.value === this.storageClassText.trim();
        });
        if (index === -1) {
          this.obj.extend.storageClasses.push(this.storageClassText.trim());
          this.obj.DefaultStorageClass = this.storageClassText.trim();
          this.storageClassText = '';
        }
      },
      createImageRepo() {
        const index = this.imageRepoItems.findIndex((sc) => {
          return sc.value === this.imageRepoText.trim();
        });
        if (index === -1) {
          this.obj.extend.imageRepos.push(this.imageRepoText.trim());
          this.obj.ImageRepo = this.imageRepoText.trim();
          this.imageRepoText = '';
        }
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
