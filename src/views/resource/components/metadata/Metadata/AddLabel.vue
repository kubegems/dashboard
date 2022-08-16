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
  <BaseDialog
    v-model="dialog"
    icon="mdi-tag-plus"
    :title="$root.$t('operate.add_c', [$t('tip.label')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.label')])" />
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.key"
              class="my-0"
              :label="$root.$t('form.key')"
              required
              :rules="objRules.keyRule"
            />
            <v-text-field
              v-model="obj.value"
              class="my-0"
              :label="$root.$t('form.value')"
              required
              :rules="objRules.valueRule"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addLabel">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { patchMetadataNode } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { k8sLabel, k8sName, required } from '@/utils/rules';

  export default {
    name: 'AddLabel',
    i18n: {
      messages: messages,
    },
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
      resource: null,
      obj: {
        key: '',
        value: '',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          keyRule: [required, k8sName],
          valueRule: [required, k8sLabel],
        };
      },
    },
    watch: {
      item() {
        this.metadata = this.item.metadata;
        this.resource = this.item;
      },
    },
    mounted() {
      if (this.item) {
        this.metadata = this.item.metadata;
        this.resource = this.item;
      }
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addLabel() {
        if (this.$refs.form.validate(true)) {
          this.metadata.labels[this.obj.key] = this.obj.value;
          await patchMetadataNode(this.ThisCluster, this.resource.metadata.name, {
            Annotations: this.metadata.annotations,
            Labels: this.metadata.labels,
          });
          this.$emit('refresh', this.obj, 'label');
          this.reset();
        }
      },
      init(item) {
        this.metadata = item.metadata;
        this.resource = item;
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
