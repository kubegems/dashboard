<template>
  <v-card>
    <v-card-title class="text-h6 primary--text">
      {{ item ? item.name : '' }}
    </v-card-title>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 项目 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? Project().ProjectName : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="ThisAppEnvironmentID" two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 环境 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ Environment().EnvironmentName }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 服务类型 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? item.kind : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 创建人 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item ? item.runtime.creator : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> 创建时间 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ item && item.runtime.createAt ? $moment(item.runtime.createAt).format('lll') : '' }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex';

  import BaseResource from '@/mixins/resource';

  export default {
    name: 'ResourceInfo',
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    computed: {
      ...mapGetters(['Project', 'Environment']),
    },
  };
</script>
