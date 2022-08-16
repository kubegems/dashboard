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
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" small text @click="resourceYaml">
            <v-icon left small> mdi-code-json </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateJob"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeJob"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="job" />
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>

        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :item="job"
          :selector="{
            topkind: 'Job',
            topname: job ? job.metadata.name : '',
          }"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="job" />
    <UpdateJob ref="updateJob" @refresh="jobDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import ResourceInfo from './components/ResourceInfo';
  import UpdateJob from './components/UpdateJob';
  import { deleteJob, getJobDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import EventList from '@/views/resource/components/common/EventList';
  import PodList from '@/views/resource/components/common/PodList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'JobDetail',
    components: {
      BasicResourceInfo,
      EventList,
      Metadata,
      PodList,
      ResourceInfo,
      ResourceYaml,
      UpdateJob,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      job: null,
      tab: 0,
    }),
    computed: {
      ...mapState(['JWT', 'MessageStreamWS']),
      tabItems() {
        return [
          { text: this.$root.$t('tab.resource_info'), value: 'ResourceInfo' },
          { text: this.$root.$t('tab.metadata'), value: 'Metadata' },
          { text: this.$root.$t('tab.pod'), value: 'PodList' },
          { text: this.$root.$t('tab.event'), value: 'EventList' },
        ];
      },
    },
    watch: {
      '$store.state.MessageStream': {
        handler: function (updatingJob) {
          if (!updatingJob) return;
          const job = JSON.parse(updatingJob);
          if (job.MessageType !== 'objectChanged') return;
          if (job.Content && this.job && job.Content.metadata.name === this.job.metadata.name) {
            if (job.EventKind === 'delete') {
              this.$router.push({ name: 'job-list', params: this.$route.params });
            } else {
              this.job = job.Content;
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.jobDetail();
        });
      }
    },
    methods: {
      async jobDetail() {
        const data = await getJobDetail(this.ThisCluster, this.$route.query.namespace, this.$route.params.name);
        this.job = data;
        this.watchJob();
      },
      watchJob() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchJobList = [];
        watchJobList.push(`${this.job.metadata.namespace}/${this.job.metadata.name}`);
        sub.content[this.ThisCluster] = { Job: watchJobList };
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateJob() {
        this.$refs.updateJob.init(this.job);
        this.$refs.updateJob.open();
      },
      removeJob() {
        const item = this.job;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.job')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.job')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteJob(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({ name: 'job-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
