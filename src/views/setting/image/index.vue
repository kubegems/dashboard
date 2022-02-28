<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2 kubegems__detail text-subtitle-1">镜像安全设置</v-card-title>
      <v-form
        class="pa-4"
        lazy-validation
      >
        <v-switch
          class="mb-4"
          hide-details
          label="启用镜像扫描和分析报告"
        />
        <v-text-field
          class="my-0"
          required
          label="harbor地址"
        />
        <v-text-field
          class="my-0"
          required
          label="用户名"
        />
        <v-text-field
          class="my-0"
          required
          label="密码"
        />
        <v-btn
          color="primary"
          depressed
          small
        >
          保存
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'ImageSecuritySetting',
  data: () => ({
    breadcrumb: {
      title: '镜像安全',
      tip: '基于 Harbor2.0 镜像仓库以及镜像安全扫描配置',
      icon: 'mdi-lock',
    },
  }),
}
</script>
