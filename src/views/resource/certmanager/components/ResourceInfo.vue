<template>
  <v-sheet>
    <v-sheet class="pa-2">
      <BaseListItemForDetail title="到期时间">
        <template #content>
          {{
            certificate && certificate.status && certificate.status.notAfter
              ? $moment(certificate.status.notAfter).format('lll')
              : ''
          }}
        </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail title="下次更新时间">
        <template #content>
          {{
            certificate && certificate.status && certificate.status.renewalTime
              ? $moment(certificate.status.renewalTime).format('lll')
              : ''
          }}
        </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail title="密钥名">
        <template #content>
          {{ certificate ? certificate.spec.secretName : '' }}
        </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail title="颁发者">
        <template #content>
          {{ certificate ? certificate.spec.issuerRef.name : '' }}
        </template>
      </BaseListItemForDetail>
    </v-sheet>

    <BaseDivider />

    <BaseSubTitle
      title="DNS名"
      :divider="false"
      class="mt-2 pl-4"
    />
    <v-simple-table class="mx-2 pa-2">
      <template #default>
        <thead>
          <tr>
            <th class="text-left">DNS</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in certificate
              ? certificate.spec.dnsNames
              : []"
            :key="index"
          >
            <td>{{ item }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <BaseDivider />

    <v-flex v-if="certificate && certificate.spec.usages">
      <BaseSubTitle
        title="扩展"
        :divider="false"
        class="mt-2 pl-4"
      />
      <v-simple-table class="mx-2 pa-2">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">公钥用法</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in certificate
                ? certificate.spec.usages
                : []"
              :key="index"
            >
              <td>{{ item }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <v-flex />
    </v-flex>
  </v-sheet>
</template>

<script>
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ResourceInfo',
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      certificate: null,
    }
  },
  watch: {
    item() {
      this.certificate = deepCopy(this.item)
    },
  },
  mounted() {
    if (this.item) this.certificate = deepCopy(this.item)
  },
}
</script>
