<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" title="重试次数">
          <template #content>
            {{ job ? job.spec.backoffLimit : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="并行数量">
          <template #content>
            {{ job ? job.spec.parallelism : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="完成时间">
          <template #content>
            {{
              job
                ? job.status.completionTime
                  ? $moment(job.status.completionTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                  : ''
                : ''
            }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="成功数量">
          <template #content>
            {{ job ? job.status.succeeded : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" title="容器" />
      <DetailContainer
        :containers="
          job
            ? job.spec.template.spec.containers.concat(
                job.spec.template.spec.initContainers
                  ? job.spec.template.spec.initContainers.map((i) => {
                      return { ...i, showName: `${i.name} (init)` };
                    })
                  : [],
              )
            : []
        "
      />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" title="卷" />
      <DetailVolume :volumes="job ? job.spec.template.spec.volumes : []" />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" title="环境变量" />
      <DetailEnv :containers="job ? job.spec.template.spec.containers : []" />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" title="状况" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Type</th>
              <th class="text-left">状态</th>
              <th class="text-left">上次改变时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in job ? job.status.conditions : []" :key="index">
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
        job: null,
      };
    },
    watch: {
      item() {
        this.job = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.job = deepCopy(this.item);
    },
  };
</script>
