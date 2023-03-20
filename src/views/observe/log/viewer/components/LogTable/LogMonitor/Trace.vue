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
  <div class="px-4 mt-n2">
    <template v-if="traceid">
      <div class="content">
        <v-btn class="share__btn" color="primary" icon small @click="toTrace">
          <v-icon small>mdi-open-in-new</v-icon>
        </v-btn>
        <BaseTimelineChart
          v-if="telemetry.spans"
          :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
          colorful
          :duration="getDuration(telemetry) / 1000"
          :label-show="false"
          :metrics="getMetrics(telemetry)"
        />
      </div>
    </template>
    <div v-else class="no__trace text-subtitle-1">{{ i18nLocal.t('tip.no_trace') }}</div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';

  import { useI18n } from '../../../../i18n';
  import { useRouter } from '@/composition/router';
  import { useStore } from '@/store';
  import { Telemetry } from '@/types/opentelemetry';

  const props = withDefaults(
    defineProps<{
      traceid?: string;
      item?: any;
    }>(),
    {
      traceid: undefined,
      item: undefined,
    },
  );

  const store = useStore();
  const router = useRouter();
  const i18nLocal = useI18n();

  const telemetry = ref(new Telemetry());
  const getTrace = async () => {
    telemetry.value = await new Telemetry().getTraceDetail(props.item.stream.cluster, props.traceid, {});
  };

  watch(
    () => props.traceid,
    async (value) => {
      if (value) {
        getTrace();
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const getDuration = (item: Telemetry): number => {
    if (item.spans?.length > 0) {
      const ends = item.spans.map((span) => {
        return span.startTime + span.duration;
      });
      return Math.max(...ends) - item.spans[0].startTime;
    }
    return 0;
  };

  const getMetrics = (item: Telemetry): any[] => {
    return [
      {
        label: item.traceID,
        data: item.spans.map((span) => {
          return {
            x: [span.startTime / 1000, span.startTime / 1000 + span.duration / 1000],
            y: `${item.processes[span.processID].serviceName} (${span.spanID.substr(0, 7)})`,
            operation: `${span.operationName}   ${span.duration / 1000}ms`,
          };
        }),
      },
    ];
  };

  const toTrace = (): void => {
    const href = router.resolve({
      name: 'observe-trace-search',
      query: {
        traceId: props.traceid,
        project: props.item.stream.project,
        environment: props.item.stream.environment,
      },
    }).href;
    window.open(href);
  };

  const dispose = (): void => {
    telemetry.value = new Telemetry();
    return;
  };

  defineExpose({
    dispose,
  });
</script>

<style lang="scss" scoped>
  .content {
    position: relative;
  }

  .share__btn {
    position: absolute;
    right: 0;
    z-index: 999;
  }

  .no__trace {
    height: 300px;
    text-align: center;
    margin-top: 150px;
  }
</style>
