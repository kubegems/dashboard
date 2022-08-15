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
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" :title="$t('table.expire_at')">
          <template #content>
            {{
              certificate && certificate.status && certificate.status.notAfter
                ? $moment(certificate.status.notAfter).format('lll')
                : ''
            }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('table.renew_at')">
          <template #content>
            {{
              certificate && certificate.status && certificate.status.renewalTime
                ? $moment(certificate.status.renewalTime).format('lll')
                : ''
            }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('table.secret_name')">
          <template #content>
            {{ certificate ? certificate.spec.secretName : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('table.issuer')">
          <template #content>
            {{ certificate ? certificate.spec.issuerRef.name : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('table.dns_name')" />
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
      <v-card class="mt-3" flat>
        <BaseSubTitle class="pt-2" :divider="false" :title="$t('table.extend')" />
        <v-simple-table class="mx-2 pa-2 pb-3">
          <template #default>
            <thead>
              <tr>
                <th class="text-left">{{ $t('tip.key_use') }}</th>
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
  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    i18n: {
      messages: messages,
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
