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
                  <v-btn color="primary" small text @click="updateCronJob"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeCronJob"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BasicResourceInfo :item="cronjob" />
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
          :item="cronjob"
          :selector="{
            topkind: 'CronJob',
            topname: cronjob ? cronjob.metadata.name : '',
          }"
        />
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="cronjob" />
    <UpdateCronJob ref="updateCronJob" @refresh="cronJobDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import JobList from './components/JobList';
  import ResourceInfo from './components/ResourceInfo';
  import UpdateCronJob from './components/UpdateCronJob';
  import messages from './i18n';
  import { deleteCronJob, getCronJobDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import EventList from '@/views/resource/components/common/EventList';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import Metadata from '@/views/resource/components/metadata/Metadata';

  export default {
    name: 'CronJobDetail',
    i18n: {
      messages: messages,
    },
    components: {
      BasicResourceInfo,
      EventList,
      JobList,
      Metadata,
      ResourceInfo,
      ResourceYaml,
      UpdateCronJob,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      cronjob: null,
      tab: 0,
    }),
    computed: {
      ...mapState(['JWT', 'MessageStreamWS']),
      tabItems() {
        return [
          { text: this.$root.$t('tab.resource_info'), value: 'ResourceInfo' },
          { text: this.$root.$t('tab.metadata'), value: 'Metadata' },
          { text: this.$t('tab.job'), value: 'JobList' },
          { text: this.$root.$t('tab.event'), value: 'EventList' },
        ];
      },
    },
    watch: {
      '$store.state.MessageStream': {
        handler: function (updatingCronJob) {
          if (!updatingCronJob) return;
          const cronJob = JSON.parse(updatingCronJob);
          if (cronJob.MessageType !== 'objectChanged') return;
          if (cronJob.Content && this.cronjob && cronJob.Content.metadata.name === this.cronjob.metadata.name) {
            if (cronJob.EventKind === 'delete') {
              this.$router.push({ name: 'cronjob-list', params: this.$route.params });
            } else {
              this.cronjob = cronJob.Content;
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
          this.cronJobDetail();
        });
      }
    },
    methods: {
      async cronJobDetail() {
        const data = await getCronJobDetail(this.ThisCluster, this.$route.query.namespace, this.$route.params.name);
        this.cronjob = data;
        this.watchCronJob();
      },
      watchCronJob() {
        const sub = {
          kind: 'objectChanged',
          content: {},
        };
        const watchCronJobList = [];
        watchCronJobList.push(`${this.cronjob.metadata.namespace}/${this.cronjob.metadata.name}`);
        sub.content[this.ThisCluster] = { CronJob: watchCronJobList };
        if (this.MessageStreamWS && this.MessageStreamWS.readyState === 1) {
          this.MessageStreamWS.send(JSON.stringify(sub));
        }
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateCronJob() {
        this.$refs.updateCronJob.init(this.cronjob);
        this.$refs.updateCronJob.open();
      },
      removeCronJob() {
        const item = this.cronjob;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.cronjob')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.cronjob')])} ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteCronJob(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({ name: 'cronjob-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
