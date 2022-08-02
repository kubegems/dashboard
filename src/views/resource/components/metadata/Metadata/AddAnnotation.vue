<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <BaseDialog v-model="dialog" icon="mdi-tag-plus" title="添加注解" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="注解定义" />
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field v-model="obj.key" class="my-0" label="键" required :rules="objRules.keyRule" />
            <v-text-field v-model="obj.value" class="my-0" label="值" required :rules="objRules.valueRule" />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addAnnotation"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { patchMetadataNode } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { k8sAnnotation, required } from '@/utils/rules';

  export default {
    name: 'AddAnnotation',
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      dialog: false,
      valid: false,
      metadata: null,
      obj: {
        key: '',
        value: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          keyRule: [required, k8sAnnotation],
          valueRule: [required, k8sAnnotation],
        };
      },
    },
    watch: {
      item() {
        this.metadata = this.item.metadata;
      },
    },
    mounted() {
      if (this.item) this.metadata = this.item.metadata;
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addAnnotation() {
        if (this.$refs.form.validate(true)) {
          this.metadata.annotations[this.obj.key] = this.obj.value;
          await patchMetadataNode(this.ThisCluster, this.item.metadata.name, {
            Annotations: this.metadata.annotations,
            Labels: this.metadata.labels,
          });
          this.$emit('refresh', this.obj, 'annotation');
          this.reset();
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
