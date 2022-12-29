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
  <div>
    <BaseTimelineChart :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`" colorful />
  </div>
</template>

<script lang="ts" setup>
  import { useStore } from '@/store';
  // import { Telemetry } from '@/types/opentelemetry';

  // const props = withDefaults(
  //   defineProps<{
  //     traceid?: string;
  //     item?: any;
  //     date?: number[];
  //   }>(),
  //   {
  //     traceid: undefined,
  //     item: undefined,
  //     date: undefined,
  //   },
  // );

  const store = useStore();

  // const getDuration = (item: Telemetry): number => {
  //   if (item.spans?.length > 0) {
  //     const ends = item.spans.map((span) => {
  //       return span.startTime + span.duration;
  //     });
  //     return Math.max(...ends) - item.spans[0].startTime;
  //   }
  //   return 0;
  // };

  // const getMetrics = (item: Telemetry): any[] => {
  //   return [
  //     {
  //       label: item.traceID,
  //       data: item.spans.map((span) => {
  //         return {
  //           x: [span.startTime / 1000, span.startTime / 1000 + span.duration / 1000],
  //           y: span.spanID.substr(0, 7),
  //           operation: span.operationName,
  //         };
  //       }),
  //     },
  //   ];
  // };
</script>
