<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card>
      <v-card-text>
        <v-data-table
          disable-sort
          :headers="headers"
          hide-default-footer
          :items="items"
          :items-per-page="100"
          no-data-text="暂无数据"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
  export default {
    name: 'Role',
    data: () => ({
      items: [
        {
          id: 1,
          role: '系统管理员',
          type: '系统',
          description: '可以操作系统所有的资源，用户，租户',
        },
        {
          id: 2,
          role: '系统成员',
          type: '系统',
          description: '没有任何系统级别的权限',
        },

        {
          id: 3,
          role: '租户管理员',
          type: '租户',
          description: '可以操作租户下所有资源',
        },
        {
          id: 4,
          role: '租户成员',
          type: '租户',
          description: '只能看到自己参与的项目',
        },

        {
          id: 5,
          role: '项目管理员',
          type: '项目',
          description: '可以操作项目下的所有资源',
        },
        {
          id: 6,
          role: '项目测试',
          type: '项目',
          description: '仅可以操作测试属性的环境',
        },
        {
          id: 7,
          role: '项目研发',
          type: '项目',
          description: '仅可以操作研发属性的环境',
        },
        {
          id: 8,
          role: '项目运维',
          type: '项目',
          description: '可以操作所有环境',
        },

        {
          id: 9,
          role: '环境成员',
          type: '环境',
          description: '只可以查看环境下的资源',
        },
        {
          id: 10,
          role: '环境管理员',
          type: '环境',
          description: '可以操作环境下的资源',
        },
        {
          id: 11,
          role: '虚拟空间成员',
          type: '微服务',
          description: '查看微服务虚拟空间下的资源',
        },
        {
          id: 12,
          role: '虚拟空间管理员',
          type: '微服务',
          description: '可以操作微服务虚拟空间下的资源',
        },
      ],
      headers: [
        { text: '角色', value: 'role', align: 'start', width: 300 },
        { text: '类别', value: 'type', align: 'start' },
        { text: '说明', value: 'description', align: 'start' },
      ],
    }),
  };
</script>
