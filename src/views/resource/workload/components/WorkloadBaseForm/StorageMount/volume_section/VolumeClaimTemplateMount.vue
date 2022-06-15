<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-sheet class="pt-2 px-2">
      <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
        <span>模版定义</span>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field v-model="obj.metadata.name" class="my-0" label="卷名称" required :rules="objRules.nameRule" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-if="$route.params.environment || $route.params.cluster"
          v-model="obj.spec.storageClassName"
          class="my-0"
          color="primary"
          hide-selected
          :items="storageClasses"
          label="存储类型"
          no-data-text="暂无可选数据"
          :rules="objRules.storageClassNameRule"
          @focus="onStorageClassSelectFocus"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="obj.spec.accessModes[0]"
          class="my-0"
          color="primary"
          hide-selected
          :items="accessModes"
          label="访问模式"
          no-data-text="暂无可选数据"
          :rules="objRules.accessModeRule"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field
          v-model="obj.spec.resources.requests.storage"
          class="my-0"
          label="容量"
          required
          :rules="objRules.storageRule"
        />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <VolumeMount
      ref="volumeMount"
      :containers="data.spec.template.spec.containers"
      type="VolumeClaimTemplate"
      :volume="volume"
      :volume-mount-name="volumeMountName"
    />
  </v-form>
</template>

<script>
  import VolumeMount from './VolumeMount';
  import { getStorageClassList } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'VolumeClaimTemplateMount',
    components: {
      VolumeMount,
    },
    mixins: [BaseResource],
    props: {
      data: {
        type: Object,
        default: () => {},
      },
      template: {
        type: Object,
        default: () => null,
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
        storageClasses: [],
        obj: {
          metadata: {
            name: '',
          },
          spec: {
            accessModes: [],
            resources: {
              requests: {
                storage: '10Gi',
              },
            },
            storageClassName: '',
          },
        },
        objRules: {
          nameRule: [required],
          storageClassNameRule: [required],
          accessModeRule: [required],
          storageRule: [required],
        },
      };
    },
    computed: {
      storageClass() {
        if (this.obj.spec.storageClassName && this.obj.spec.storageClassName !== '') {
          const sc = this.storageClasses.find((sc) => {
            return sc.metadata.name === this.obj.spec.storageClassName;
          });
          if (sc) {
            return sc;
          } else {
            return null;
          }
        } else {
          return null;
        }
      },
      accessModes() {
        if (
          this.storageClass &&
          this.storageClass.metadata.annotations[`storageclass.kubegems.io/supported-access-modes`]
        ) {
          const modes =
            this.storageClass.metadata.annotations[`storageclass.kubegems.io/supported-access-modes`].split(',');
          const accessModes = [];
          modes.forEach((mode) => {
            if (mode === 'rwo') {
              accessModes.push({ text: '单节点读写', value: 'ReadWriteOnce' });
            } else if (mode === 'rox') {
              accessModes.push({ text: '多节点只读', value: 'ReadOnlyMany' });
            } else if (mode === 'rwx') {
              accessModes.push({ text: '多节点读写', value: 'ReadWriteMany' });
            }
          });
          return accessModes;
        } else {
          return [
            { text: '单节点读写', value: 'ReadWriteOnce' },
            { text: '多节点只读', value: 'ReadOnlyMany' },
            { text: '多节点读写', value: 'ReadWriteMany' },
          ];
        }
      },
    },
    async mounted() {
      if (this.template) {
        this.storageClassList();
        this.obj = deepCopy(this.template);
        this.$refs.volumeMount.initVolumeMount(this.obj.metadata.name);
      }
    },
    methods: {
      async storageClassList() {
        const data = await getStorageClassList(this.ThisCluster, {
          size: 1000,
        });
        this.storageClasses = data.List;
        this.storageClasses.forEach((v) => {
          v.text = v.metadata.name;
          v.value = v.metadata.name;
        });
      },
      generateData() {
        if (this.$refs.form.validate(true)) {
          const data = this.$refs.volumeMount.generateData();
          if (data) {
            // this.obj.metadata.namespace = this.data?.metadata?.namespace
            for (const item in data) {
              data[item].name = this.obj.metadata.name;
            }
            return {
              volumeMount: data,
              volumeClaimTemplate: deepCopy(this.obj),
            };
          }
          return null;
        }
        return null;
      },
      onStorageClassSelectFocus() {
        this.storageClassList();
      },
    },
  };
</script>
