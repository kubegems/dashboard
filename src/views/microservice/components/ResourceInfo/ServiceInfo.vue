<template>
  <v-flex>
    <BaseListItemForDetail title="标签">
      <template #content>
        <BaseCollapseChips
          v-if="item"
          :chips="item.service.labels || {}"
          single-line
          icon="mdi-label"
        />
      </template>
    </BaseListItemForDetail>
    <BaseListItemForDetail title="类型">
      <template #content>
        {{ item ? item.service.type : '' }}
      </template>
    </BaseListItemForDetail>
    <BaseListItemForDetail title="Endpoints">
      <template #content>
        <v-flex
          v-for="(endpoint, index) in item ? item.endpoints : []"
          :key="index"
        >
          <v-flex
            v-for="(address, index) in endpoint.addresses"
            :key="index"
            class="mb-1"
          >
            {{ address.ip }}
          </v-flex>
        </v-flex>
      </template>
    </BaseListItemForDetail>
    <BaseListItemForDetail title="Service IP">
      <template #content>
        {{ item ? item.service.ip : '' }}
      </template>
    </BaseListItemForDetail>
    <BaseListItemForDetail title="端口">
      <template #content>
        <v-flex class="text-body-2">
          <BaseCollapseChips
            v-if="item"
            :chips="services || []"
            single-line
            icon="mdi-directions-fork"
          />
        </v-flex>
      </template>
    </BaseListItemForDetail>
  </v-flex>
</template>

<script>
export default {
  name: 'ServiceInfo',
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      services: [],
    }
  },
  watch: {
    item() {
      this.services = []
      this.item.service.ports.forEach((s) => {
        if (s.nodePort !== undefined) {
          this.services.push(`${s.port}:${s.nodePort} ｜ ${s.protocol}`)
        } else {
          this.services.push(`${s.port} ｜ ${s.protocol}`)
        }
      })
    },
  },
}
</script>
