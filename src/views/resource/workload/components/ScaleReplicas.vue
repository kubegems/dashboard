<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <BaseDialog v-model="dialog" icon="fas fa-arrows-alt-v" title="调整副本数" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle title="副本定义" />
      <v-card-text class="px-2 pb-0">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-flex class="text-subtitle-1 mb-2">
              当前副本数
              <span class="text-subtitle-2 primary--text">
                {{ item ? item.spec.replicas : 0 }}
              </span>
            </v-flex>
            <v-text-field
              v-model="obj.Replicas"
              class="my-0"
              label="目标副本数"
              required
              :rules="objRules.ReplicasRules"
              type="number"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="scaleWorkload"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { patchScaleWorkloadReplicas } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'ScaleReplicas',
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
      obj: {
        Replicas: 0,
      },
      objRules: {
        ReplicasRules: [(v) => parseInt(v) >= 0 || '小于最小限制'],
      },
    }),
    computed: {
      ...mapState(['Circular']),
    },
    watch: {
      item: {
        handler() {
          this.obj.Replicas = this.item.spec.replicas;
        },
        deep: true,
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async scaleWorkload() {
        if (this.$refs.form.validate(true)) {
          await patchScaleWorkloadReplicas(
            this.ThisCluster,
            this.$route.query.namespace,
            this.$route.query.type,
            this.item.metadata.name,
            {
              Replicas: parseInt(this.obj.Replicas),
            },
          );
          this.$emit('refresh');
          this.reset();
        }
      },
      reset() {
        this.dialog = false;
        this.obj.Replicas = this.item.spec.replicas;
      },
    },
  };
</script>
