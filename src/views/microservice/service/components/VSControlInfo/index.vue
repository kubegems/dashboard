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
  <v-flex v-if="mode === 'fault_injection'">
    <BaseListItemForDetail title="请求延迟百分比">
      <template #content>
        {{ vs && vs.fault.delay ? `${vs.fault.delay.percentage.value} %` : '' }}
      </template>
    </BaseListItemForDetail>
    <BaseListItemForDetail title="固定延迟时间">
      <template #content>
        {{ vs && vs.fault.delay ? vs.fault.delay.fixedDelay : '' }}
      </template>
    </BaseListItemForDetail>
    <BaseListItemForDetail title="请求中止百分比">
      <template #content>
        {{ vs && vs.fault.abort ? `${vs.fault.abort.percentage.value} %` : '' }}
      </template>
    </BaseListItemForDetail>
    <BaseListItemForDetail title="请求中止状态码">
      <template #content>
        {{ vs && vs.fault.abort ? vs.fault.abort.httpStatus : '' }}
      </template>
    </BaseListItemForDetail>
  </v-flex>
  <v-flex v-else-if="mode === 'request_timeouts'">
    <BaseListItemForDetail title="请求超时时间">
      <template #content>
        {{ vs ? vs.timeout : '' }}
      </template>
    </BaseListItemForDetail>
    <BaseListItemForDetail title="重试次数">
      <template #content>
        {{ vs ? vs.retries.attempts : '' }}
      </template>
    </BaseListItemForDetail>
    <BaseListItemForDetail title="每次重试超时时间">
      <template #content>
        {{ vs ? vs.retries.perTryTimeout : '' }}
      </template>
    </BaseListItemForDetail>
  </v-flex>
  <v-flex v-else-if="mode === 'traffic_shifting'">
    <BaseSubTitle class="mt-4 pl-2" :divider="false" title="Route" />
    <RouteList :routes="vs ? vs.route : []" />
  </v-flex>
  <v-flex v-else-if="mode === 'tcp_traffic_shifting'">
    <BaseSubTitle class="mt-4 pl-2" :divider="false" title="Route" />
    <RouteList :routes="vs ? vs.route : []" />
  </v-flex>
  <v-flex v-else-if="mode === 'request_routing'">
    <BaseSubTitle class="mt-4 pl-2" :divider="false" title="Match" />
    <MatchList :matchs="vs ? vs.match : []" />

    <BaseSubTitle class="mt-4 pl-2" :divider="false" title="Route" />
    <RouteList :routes="vs ? vs.route : []" />
  </v-flex>
</template>

<script>
  import MatchList from './MatchList';
  import RouteList from './RouteList';

  export default {
    name: 'VSControlInfo',
    components: {
      MatchList,
      RouteList,
    },
    props: {
      vs: {
        type: Object,
        default: () => null,
      },
      mode: {
        type: String,
        default: () => null,
      },
    },
  };
</script>
