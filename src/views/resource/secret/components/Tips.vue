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
    <v-menu
      :close-delay="200"
      :close-on-content-click="false"
      max-width="200px"
      offset-y
      open-on-hover
      :origin="`${top ? 'bottom center' : 'top center'}`"
      right
      :top="top"
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <v-icon color="success" small v-on="on"> mdi-information </v-icon>
        <span
          class="success--text text-caption font-weight-medium kubegems__pointer kubegems__attach-position"
          v-on="on"
        >
          证书信息
        </span>
      </template>
      <v-card>
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small> mdi-certificate </v-icon>
          <span>证书信息</span>
        </v-flex>
        <v-list class="pa-0 kubegems__tip" dense>
          <v-list-item>
            <v-list-item-content>
              <template v-if="item['tls.crt'] && item['tls.crt'].subject && item['tls.crt'].subject.common_name">
                <v-list-item-title> 通用名称 </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text">
                  {{ item['tls.crt'].subject.common_name }}
                </v-list-item-content>
              </template>
              <template v-if="item['tls.crt'] && item['tls.crt'].subject && item['tls.crt'].subject.organization">
                <v-list-item-title> 组织 </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text">
                  {{ item['tls.crt'].subject.organization }}
                </v-list-item-content>
              </template>
              <template
                v-if="item['tls.crt'] && item['tls.crt'].subject && item['tls.crt'].subject.organizational_unit"
              >
                <v-list-item-title> 部门 </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text">
                  {{ item['tls.crt'].subject.organizational_unit }}
                </v-list-item-content>
              </template>
              <template v-if="item['tls.crt'] && item['tls.crt'].sigalg">
                <v-list-item-title> 签名算法 </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text">
                  {{ item['tls.crt'].sigalg }}
                </v-list-item-content>
              </template>
              <template v-if="item['tls.crt'] && item['tls.crt'].not_before">
                <v-list-item-title> 颁发时间 </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text">
                  {{ $moment(item['tls.crt'].not_before).format('lll') }}
                </v-list-item-content>
              </template>
              <template v-if="item['tls.crt'] && item['tls.crt'].not_after">
                <v-list-item-title> 过期时间 </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text">
                  {{ $moment(item['tls.crt'].not_after).format('lll') }}
                </v-list-item-content>
              </template>
              <template v-if="item['tls.crt'] && item['tls.crt'].serial_number">
                <v-list-item-title> 序列号 </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text v-list-item__content">
                  {{ item['tls.crt'].serial_number }}
                </v-list-item-content>
              </template>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
  export default {
    name: 'Tips',
    props: {
      item: {
        type: Object,
        default: () => {},
      },
      top: {
        type: Boolean,
        default: () => false,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-list-item__content {
    word-break: break-all;
  }
</style>
