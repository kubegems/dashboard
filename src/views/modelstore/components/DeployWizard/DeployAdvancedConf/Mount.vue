<template>
  <v-menu
    v-model="menu"
    bottom
    :close-on-content-click="false"
    left
    nudge-top="20"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-combobox
        v-model="mounts"
        hide-no-data
        hide-selected
        :items="[]"
        :label="$t('tip.volume_mount')"
        :menu-props="{
          bottom: true,
          left: true,
          origin: `top center`,
        }"
        multiple
        v-on="on"
      >
        <template #selection="{ item }">
          <v-chip
            class="my-1"
            close
            close-icon="mdi-close-circle"
            color="primary"
            small
            text-color="white"
            @click:close="removePort(item)"
          >
            <strong class="mx-1"> {{ item.kind }} </strong>
            {{ $t('tip.mount_path') }} : {{ item.mountPath }}
          </v-chip>
        </template>
      </v-combobox>
    </template>
    <v-card>
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid" class="px-2" lazy-validation @click.stop @submit.prevent>
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="obj.kind"
                hide-no-data
                hide-selected
                :items="kindItems"
                :label="$t('tip.volume_type')"
                :menu-props="{
                  bottom: true,
                  left: true,
                  origin: `top center`,
                }"
                :rules="objRules.kindRules"
                @change="onKindChange"
              />
            </v-col>
            <v-col v-if="obj.kind === 'HostPath'">
              <v-text-field
                v-model.number="obj.sourcePath"
                :label="$t('tip.origin_path')"
                :rules="objRules.sourcePathRules"
              />
            </v-col>
            <v-col v-else-if="obj.kind === 'PVC'">
              <v-autocomplete
                v-model="obj.sourcePath"
                hide-no-data
                hide-selected
                :items="persistentVolumeClaimItems"
                :label="$t('tip.volume_name')"
                :menu-props="{
                  bottom: true,
                  left: true,
                  origin: `top center`,
                }"
                :rules="objRules.sourcePathRules"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model.number="obj.mountPath"
                :label="$t('tip.mount_path')"
                :rules="objRules.mountPathRules"
              />
            </v-col>
            <v-col v-if="obj.kind === 'EmptyDir' || obj.kind === 'Model'" />
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-title class="pa-0">
        <v-spacer />
        <v-btn class="mr-2 mb-2" color="primary" dark right small text @click="addMount">
          {{ $root.$t('operate.confirm') }}
        </v-btn>
      </v-card-title>
    </v-card>
  </v-menu>
</template>

<script>
  import messages from '../../../i18n';
  import { getPersistentVolumeClaimList } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'Mount',
    i18n: {
      messages: messages,
    },
    props: {
      base: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        menu: false,
        mounts: [],
        obj: {
          kind: 'HostPath',
          mountPath: '',
          sourcePath: '',
        },
        objRules: {
          kindRules: [required],
          mountPathRules: [required],
          sourcePathRules: [required],
        },
        kindItems: [
          { text: 'PersistentVolumeClaim', value: 'PVC' },
          { text: 'HostPath', value: 'HostPath' },
          { text: 'EmptyDir', value: 'EmptyDir' },
          { text: 'Model', value: 'Model' },
        ],
        persistentVolumeClaimItems: [],
      };
    },
    watch: {
      value: {
        handler(newValue) {
          if (newValue) {
            this.mounts = newValue;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      addMount() {
        if (this.$refs.form.validate(true)) {
          this.mounts.push(deepCopy(this.obj));
          this.menu = false;
          this.obj = this.$options.data().obj;
          this.$refs.form.resetValidation();

          this.$emit('input', this.mounts);
          this.$emit('change', this.mounts);
        }
      },
      removePort(item) {
        const index = this.mounts.findIndex((e) => {
          return e.kind === item.kind && e.mountPath === item.mountPath;
        });
        if (index > -1) {
          this.mounts.splice(index, 1);
        }

        this.$emit('input', this.mounts);
        this.$emit('change', this.mounts);
      },
      async onKindChange() {
        this.obj.sourcePath = '';
        if (this.obj.kind === 'PVC') {
          const data = await getPersistentVolumeClaimList(this.base.cluster, this.base.namespace, { size: 1000 });
          this.persistentVolumeClaimItems = data.List.map((p) => {
            return { text: p.metadata.name, value: p.metadata.name };
          });
        }
      },
    },
  };
</script>
