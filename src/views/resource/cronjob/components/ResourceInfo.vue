<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" title="调度">
          <template #content>
            {{ cronjob ? cronjob.spec.schedule : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="上一次调度">
          <template #content>
            {{
              cronjob && cronjob.status.lastScheduleTime
                ? $moment(cronjob.status.lastScheduleTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                : ''
            }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="并发策略">
          <template #content>
            {{ cronjob ? cronjob.spec.concurrencyPolicy : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="历史成功数量限制">
          <template #content>
            {{ cronjob ? cronjob.spec.successfulJobsHistoryLimit : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="历史失败数量限制">
          <template #content>
            {{ cronjob ? cronjob.spec.failedJobsHistoryLimit : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="暂停">
          <template #content>
            {{ cronjob ? cronjob.spec.suspend : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" title="容器" />
      <DetailContainer :containers="cronjob ? cronjob.spec.jobTemplate.spec.template.spec.containers : []" />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" title="卷" />
      <DetailVolume :volumes="cronjob ? cronjob.spec.jobTemplate.spec.template.spec.volumes : []" />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" title="环境变量" />
      <DetailEnv :containers="cronjob ? cronjob.spec.jobTemplate.spec.template.spec.containers : []" />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" title="状况" />
      <v-simple-table class="mx-2 pa-2">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Type</th>
              <th class="text-left">状态</th>
              <th class="text-left">上次改变时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in cronjob ? cronjob.status.conditions : []" :key="index">
              <td>{{ item.type }}</td>
              <td>
                <span v-if="item.status === 'True'">
                  <v-icon color="primary" small> fas fa-check-circle </v-icon>
                </span>
                <span v-else>
                  <v-icon color="error" small>fas fa-minus-circle</v-icon>
                </span>
              </td>
              <td>{{ $moment(item.lastUpdateTime).format('lll') }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import DetailContainer from '@/views/resource/components/common/DetailContainer';
  import DetailEnv from '@/views/resource/components/common/DetailEnv';
  import DetailVolume from '@/views/resource/components/common/DetailVolume';

  export default {
    name: 'ResourceInfo',
    components: {
      DetailContainer,
      DetailEnv,
      DetailVolume,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        cronjob: null,
      };
    },
    watch: {
      item() {
        this.cronjob = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.cronjob = deepCopy(this.item);
    },
  };
</script>
