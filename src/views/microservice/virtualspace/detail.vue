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
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <span class="text-body-2 mx-2">
            {{ $root.$t('resource.mesh') }} :
            {{ VirtualSpace().VirtualSpaceName }}
          </span>
          <span class="text-body-2 mx-2">
            {{ $root.$t('resource.mesh_c', [$root.$t('resource.role')]) }} :
            {{
              $VIRTUALSPACE_ROLE[m_permisson_virtualSpaceRole]
                ? $root.$t(`role.mesh.${m_permisson_virtualSpaceRole}`)
                : $root.$t('data.unknown')
            }}
          </span>
          <v-btn class="primary--text" small text @click="manageUser">
            <v-icon left small> mdi-account-settings </v-icon>
            {{ $root.$t('resource.mesh_c', [$root.$t('resource.member')]) }}
          </v-btn>
          <v-btn class="primary--text" small text @click="returnVirtualSpace">
            <v-icon left small> mdi-logout </v-icon>
            {{ $root.$t('operate.return') }}
          </v-btn>
          <v-menu v-if="m_permisson_tenantAllow || m_permisson_virtualSpaceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateVirtualSpace"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeVirtualSpace"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <DashboardCard class="mt-3" :virtualspace="virtualspace" />
    <EnvironmentList :virtualspace="virtualspace" @refresh="virtualSpaceDetail" />
    <UpdateVirtualSpace ref="updateVirtualSpace" @refresh="virtualSpaceDetail" />
    <ManageUser ref="manageUser" :virtualspace="virtualspace" @refresh="virtualSpaceDetail" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import DashboardCard from './components/DashboardCard';
  import EnvironmentList from './components/EnvironmentList';
  import ManageUser from './components/ManageUser';
  import UpdateVirtualSpace from './components/UpdateVirtualSpace';
  import { deleteVirtualSpace, getVirtualSpaceDetail } from '@/api';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'VirtualSpaceDetail',
    components: {
      DashboardCard,
      EnvironmentList,
      ManageUser,
      UpdateVirtualSpace,
    },
    mixins: [BasePermission],
    data: () => ({
      virtualspace: null,
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      ...mapGetters(['VirtualSpace']),
    },
    async mounted() {
      if (this.JWT) {
        this.virtualSpaceDetail();
      }
    },
    methods: {
      async virtualSpaceDetail() {
        const data = await getVirtualSpaceDetail(this.VirtualSpace().ID);
        this.virtualspace = data;
      },
      updateVirtualSpace() {
        this.$refs.updateVirtualSpace.init(this.virtualspace);
        this.$refs.updateVirtualSpace.open();
      },
      removeVirtualSpace() {
        const item = this.virtualspace;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.mesh')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.mesh')])} ${item.VirtualSpaceName}`,
            type: 'delete',
            name: item.VirtualSpaceName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteVirtualSpace(param.item.ID);
            this.$store.commit('CLEAR_VIRTUAL_SPACE');
            this.$router.push({
              name: 'virtualspace-list',
              params: this.$route.params,
            });
          },
        });
      },
      returnVirtualSpace() {
        this.$store.commit('CLEAR_VIRTUAL_SPACE');
        this.$router.push({
          name: 'virtualspace-list',
          params: this.$route.params,
        });
      },
      manageUser() {
        this.$refs.manageUser.init();
        this.$refs.manageUser.open();
      },
    },
  };
</script>
