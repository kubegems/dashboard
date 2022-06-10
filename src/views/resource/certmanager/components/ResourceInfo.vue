<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail title="到期时间" :mt="0">
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
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle title="DNS名" :divider="false" class="pt-2" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">DNS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in certificate ? certificate.spec.dnsNames : []" :key="index">
              <td>{{ item }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <v-flex v-if="certificate && certificate.spec.usages">
      <v-card class="mt-3">
        <BaseSubTitle title="扩展" :divider="false" class="pt-2" />
        <v-simple-table class="mx-2 pa-2 pb-3">
          <template #default>
            <thead>
              <tr>
                <th class="text-left">公钥用法</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in certificate ? certificate.spec.usages : []" :key="index">
                <td>{{ item }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
    </v-flex>
  </div>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

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
      };
    },
    watch: {
      item() {
        this.certificate = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.certificate = deepCopy(this.item);
    },
  };
</script>
