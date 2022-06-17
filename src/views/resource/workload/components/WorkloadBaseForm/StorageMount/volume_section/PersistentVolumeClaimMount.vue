<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="volumeName"
          class="my-0"
          color="primary"
          hide-selected
          :items="items"
          label="存储卷"
          no-data-text="暂无可选数据"
          :readonly="edit"
          :rules="volumeRules"
          @change="onVolumeChange"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <v-flex v-if="volumeObj" class="pt-5">
        <span class="text-body-2 mx-1"> 类型:{{ volumeObj.spec.storageClassName }} </span>
        <span class="text-body-2 mx-1"> 容量:{{ volumeObj.spec.resources.requests.storage }} </span>
        <span class="text-body-2 mx-1"> 访问模式:{{ volumeObj.spec.accessModes[0] }} </span>
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <VolumeMount ref="volumeMount" :containers="containers" :volume="volume" :volume-mount-name="volumeMountName" />
    <VolumeMountForInitContainer
      v-if="initContainers && initContainers.length > 0"
      ref="volumeMountForInitContainer"
      :init-containers="initContainers"
      :volume="volume"
      :volume-mount-name="volumeMountName"
    />
  </v-form>
</template>

<script>
  import VolumeMount from './VolumeMount';
  import VolumeMountForInitContainer from './VolumeMountForInitContainer';
  import { getPersistentVolumeClaimList, getAppResourceFileMetas } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { required } from '@/utils/rules';

  export default {
    name: 'PersistentVolumeClaimMount',
    components: {
      VolumeMount,
      VolumeMountForInitContainer,
    },
    mixins: [BaseResource],
    props: {
      containers: {
        type: Array,
        default: () => [],
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      initContainers: {
        type: Array,
        default: () => [],
      },
      namespace: {
        type: String,
        default: () => '',
      },
      manifest: {
        type: Boolean,
        default: () => false,
      },
      volume: {
        type: Object,
        default: () => null,
      },
      volumeMountName: {
        type: String,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        volumeName: null,
        volumeRules: [required],
        items: [],
      };
    },
    computed: {
      volumeObj() {
        const index = this.items.findIndex((v) => {
          return v.metadata.name === this.volumeName;
        });
        if (index > -1) return this.items[index];
        return null;
      },
    },
    watch: {
      volume: {
        handler: function () {
          this.loadData();
        },
        deep: true,
      },
    },
    async mounted() {
      await this.persistentVolumeClaimList();
      this.loadData();
    },
    methods: {
      loadData() {
        if (this.volume) {
          this.volumeName = this.volume.persistentVolumeClaim.claimName;
        }
      },
      async persistentVolumeClaimList() {
        let data = {};
        if (this.manifest) {
          data = await getAppResourceFileMetas(
            this.$route.query.tenantid,
            this.$route.query.projectid,
            this.ThisAppEnvironmentID,
            this.$route.params.name,
            {
              kind: 'PersistentVolumeClaim',
            },
          );
          this.items = data;
        } else {
          data = await getPersistentVolumeClaimList(this.ThisCluster, this.namespace || this.$route.query.namespace, {
            size: 1000,
          });
          this.items = data.List;
        }
        this.items = this.items
          .filter((v) => {
            return !(
              v.metadata.annotations &&
              v.metadata.annotations[`pvc.kubegems.io/in-use`] === 'true' &&
              v.spec.accessModes.join('') === 'ReadWriteOnce'
            );
          })
          .map((v) => {
            return {
              text: v.metadata.name,
              value: v.metadata.name,
              ...v,
            };
          });
      },
      onVolumeChange() {
        this.$refs.volumeMount.initVolumeMount(this.volumeName);
        if (this.$refs.volumeMountForInitContainer) {
          this.$refs.volumeMountForInitContainer.initVolumeMount(this.volumeName);
        }
      },
      generateData() {
        if (this.$refs.form.validate(true)) {
          const data = this.$refs.volumeMount.generateData();
          if (data) {
            return {
              volumeMount: data,
              volume: {
                name: this.volume ? this.volume.name : this.volumeName,
                persistentVolumeClaim: {
                  claimName: this.volumeObj.metadata.name,
                },
              },
            };
          }
          return null;
        }
        return null;
      },
      generateInitData() {
        if (this.$refs.form.validate(true)) {
          const data = this.$refs.volumeMountForInitContainer.generateData();
          if (data) {
            return {
              init: data,
            };
          }
          return null;
        }
        return null;
      },
      reset() {
        this.$refs.form.reset();
        this.$refs.volumeMount.reset();
      },
    },
  };
</script>
