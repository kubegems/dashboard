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
    <BaseSubTitle
      title="Route"
      :divider="false"
      class="mt-4 pl-2"
    />
    <RouteList :routes="vs ? vs.route : []" />
  </v-flex>
  <v-flex v-else-if="mode === 'tcp_traffic_shifting'">
    <BaseSubTitle
      title="Route"
      :divider="false"
      class="mt-4 pl-2"
    />
    <RouteList :routes="vs ? vs.route : []" />
  </v-flex>
  <v-flex v-else-if="mode === 'request_routing'">
    <BaseSubTitle
      title="Match"
      :divider="false"
      class="mt-4 pl-2"
    />
    <MatchList :matchs="vs ? vs.match : []" />

    <BaseSubTitle
      title="Route"
      :divider="false"
      class="mt-4 pl-2"
    />
    <RouteList :routes="vs ? vs.route : []" />
  </v-flex>
</template>

<script>
import RouteList from './RouteList'
import MatchList from './MatchList'

export default {
  name: 'VSControlInfo',
  components: {
    RouteList,
    MatchList,
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
}
</script>
