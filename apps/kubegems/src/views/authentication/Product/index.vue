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
  <v-container class="ma-0 pa-0 Fadein" fluid :style="{ opacity: 0 }">
    <v-row class="ma-0 pa-0" :style="{ height: `${height}px !important` }">
      <v-col v-for="(item, index) in modules" :key="index" class="ma-0 pa-0 boxCol" :cols="item.col">
        <v-card
          v-if="item.text !== 'Platform'"
          :id="item.id"
          class="box kubegems__pointer"
          :class="{ 'rounded-0': true }"
          :elevation="0"
          height="100%"
          :style="{ backgroundColor: item.color }"
        >
          <!-- <div v-if="item.text === 'AIGems'" class="ribbon" @click="toModelHub">
            <span>{{ config.product.MODELHUB }}</span>
          </div> -->
          <div class="flash" :style="{ height: `${height}px` }" />
          <div :class="{ overlay: hasHover && !item.highlight }" />
          <div class="kubegems__full-center title-font title-card">
            {{ item.text }}
            <div class="mt-2 text-center">
              <v-btn
                v-if="!item.disabled"
                class="btn-font"
                color="white"
                :disabled="!hasTenant"
                text
                @click.stop="enterPage(item)"
              >
                {{ i18nLocal.t('tip.enter') }}
              </v-btn>
              <v-btn v-else class="btn-font" color="white" disabled text> {{ i18nLocal.t('tip.open_soon') }} </v-btn>
            </div>
          </div>
        </v-card>
        <v-card v-else :id="item.id" class="white rounded-0" height="100%">
          <v-btn
            v-if="store.state.Admin"
            bottom
            class="setting__btn"
            color="primary"
            dark
            fab
            fixed
            right
            small
            @click.stop="toSettingPage"
          >
            <v-icon>mdi-cog</v-icon>
          </v-btn>
          <div class="welcome text-center"> {{ i18nLocal.t('tip.welcome', [config.layout.PLATFORM]) }} </div>
          <div class="kubegems__full-center title-font">
            <div class="text-center">
              <v-avatar size="86">
                <img alt="user" src="/ava.jpg" />
              </v-avatar>
            </div>
            <div class="username primary--text text-center">
              {{ store.state.User.Username }}
              <v-btn class="user-setting" color="primary" depressed icon @click.stop="userSetting">
                <v-icon color="primary" small>mdi-cog</v-icon>
              </v-btn>
            </div>
            <div class="flex">
              <div class="float-left">
                <Tenant v-model="tenant" />
              </div>
              <div v-if="!hasTenant" class="float-left orange--text text-caption tip">
                <v-icon color="orange" small>mdi-alert-circle</v-icon>
                {{ i18nLocal.t('tip.no_tenant') }}
              </div>
              <div class="kubegems__clear-float" />
            </div>
            <div class="flex">
              <Locale />
            </div>
            <div class="flex">
              <Theme />
            </div>
            <div class="flex primary--text">
              <v-btn class="primary--text font-weight-medium mb-1" color="white" dark depressed>
                {{ i18nLocal.t('tip.last_login') }}:
                {{ moment(store.state.User.LastLoginAt).format('YYYY-MM-DD HH:mm:ss') }}
              </v-btn>
            </div>
          </div>
          <div class="text-center">
            <v-btn class="kubegems__full-bottom" color="primary" depressed text @click.stop="logout">
              <v-icon>mdi-logout</v-icon>
              {{ i18n.t('logout') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams, useQuery, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { colorRgbArray, deepCopy, sleep } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { computed, ref } from 'vue';

  import { useI18n } from '../i18n';
  import Locale from './locale.vue';
  import Tenant from './tenant.vue';
  import Theme from './theme.vue';

  const store = useStore();
  const router = useRouter();
  const routeParams = useParams();
  const query = useQuery();
  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const height = computed(() => {
    return window.innerHeight / store.state.Scale;
  });

  const hasHover = computed(() => {
    return modules.value.some((m) => {
      return m.highlight;
    });
  });

  const hasTenant = computed(() => {
    return Boolean(store.getters.Tenant().TenantName);
  });

  const color = computed(() => {
    return Array.from('0123').map((item, index) => {
      const nColor = colorRgbArray(deepCopy(store.state.ThemeColor || config.theme.THEME_COLOR.primary));
      nColor.push(0.8);
      return `rgba(${nColor
        .map((c) => {
          c += 8 * (index + 1);
          return c;
        })
        .join(',')})`;
    });
  });

  const modules = computed(() => {
    return [
      {
        id: 'KubeGems',
        text: config.product.KUBEGEMS,
        color: color.value[0],
        disabled: false,
        routeName: 'resource-dashboard',
        highlight: false,
        col: 2,
      },
      {
        id: 'ObserveGems',
        text: config.product.OBSERVEGEMS,
        color: color.value[1],
        disabled: false,
        routeName: 'observe',
        highlight: false,
        col: 2,
      },
      {
        id: 'EdgeGems',
        text: config.product.EDGEGEMS,
        color: color.value[2],
        disabled: true,
        routeName: '',
        highlight: false,
        col: 2,
      },
      {
        id: 'AIGems',
        text: config.product.AIGEMS,
        color: color.value[3],
        disabled: true,
        routeName: 'pai',
        highlight: false,
        col: 2,
      },
      {
        id: 'Platform',
        text: 'Platform',
        color: 'white',
        disabled: false,
        routeName: 'platform',
        highlight: false,
        col: 4,
      },
    ];
  });

  const hover = async (item: any) => {
    await sleep(100);
    item.highlight = true;
    if (!item.disabled && hasTenant) {
      document.getElementById(item.id).classList.remove(`${item.id}-Reverse`);
      document.getElementById(item.id).style.zIndex = '999';
      modules.value.forEach((m) => {
        if (m.id !== item.id) {
          document.getElementById(m.id).classList.remove(m.id);
        }
      });
      document.getElementById(item.id).classList.add(item.id);
    }
  };

  const out = (item: any) => {
    item.highlight = false;
    if (!item.disabled && hasTenant) {
      document.getElementById(item.id).classList.remove(item.id);
      modules.value.forEach((m) => {
        if (m.id !== item.id) {
          document.getElementById(m.id).classList.remove(`${item.id}-Reverse`);
        }
      });
      document.getElementById(item.id).classList.add(`${item.id}-Reverse`);
      setTimeout(() => {
        document.getElementById(item.id).style.zIndex = '99';
      }, 300);
    }
  };

  const tenant = ref('');
  const enterPage = (item: any) => {
    store.commit('SET_EDGE', '');
    store.commit('SET_ADMIN_VIEWPORT', false);
    document.getElementById(item.id).style.zIndex = '999';
    document.getElementById(item.id).classList.add(item.id);
    document.getElementById(item.id).classList.remove('box', 'flash');
    // document.getElementById(item.id).classList.remove(item.id);
    // document.getElementById(item.id).classList.add('Enter');
    setTimeout(() => {
      store.commit('SET_ADMIN_VIEWPORT', false);
      if (!tenant.value && !store.getters.Tenant().TenantName) {
        router.push({ name: 'page' });
        return;
      }
      router.push({
        name: item.routeName,
        params: { ...routeParams.value, tenant: tenant.value || store.getters.Tenant().TenantName },
        query: query.value,
      });
    }, 400);
  };

  const toSettingPage = () => {
    router.push({ name: 'platform', params: routeParams.value, query: query.value });
  };

  const logout = async () => {
    store.commit('CLEARALL');
    await router.push({ name: 'login' });
    const version = (import.meta as any).env.VUE_APP_RELEASE;
    if (version) store.commit('SET_VERSION', version);
  };

  const userSetting = () => {
    router.push({ name: 'user-center' });
  };

  const toModelHub = () => {
    store.commit('SET_ADMIN_VIEWPORT', false);
    router.push({ name: 'pai-hub-index' });
  };
</script>

<style lang="scss" scoped>
  .box {
    overflow: hidden;
    position: relative;
    margin: auto;
    transition: all 0.2s;
  }
  .flash {
    position: absolute;
    left: -110%;
    top: 0;
    background-image: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
    transform: skew(-10deg);
  }
  .box:hover .flash {
    left: 110%;
    transition: all 0.3s;
    width: 100%;
  }

  .overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: grey;
    opacity: 0.7;
  }

  .title-font {
    font-family: 'kubegems-sample' !important;
    font-size: 1.7rem !important;
    color: white !important;
  }

  .title-card {
    width: 100%;
    text-align: center;
    padding-top: 100px;
    padding-bottom: 100px;
  }

  .btn-font {
    font-family: 'Yuanti SC', YouYuan, 'Microsoft Yahei', 'PingFang SC' !important;
    font-size: 1.1rem !important;
    color: white !important;
    margin-top: 8px;
    text-align: center;
    font-weight: 600;
  }

  .welcome {
    font-family: 'kubegems-sample' !important;
    font-size: 1.7rem !important;
    color: var(--primary-color) !important;
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .username {
    line-height: 52px;
    margin-top: 8px;
  }

  .KubeGems {
    animation-name: _KubeGems;
    animation-duration: 0.3s;
    animation-timing-function: ease-out;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  .KubeGems-Reverse {
    animation-name: _KubeGems-Reverse;
    animation-duration: 0.3s;
    animation-timing-function: ease-out;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  @keyframes _KubeGems {
    0% {
      position: absolute;
      width: 16.67%;
      bottom: 0;
      left: 0%;
    }

    25% {
      position: absolute;
      // width: 29.17%;
      width: 37.5025%;
      left: 0%;
    }

    50% {
      position: absolute;
      // width: 41.67%;
      width: 58.335%;
      left: 0%;
    }

    75% {
      position: absolute;
      // width: 54.17%;
      width: 79.1675%;
      left: 0%;
    }

    100% {
      position: absolute;
      // width: 66.67%;
      width: 100%;
      left: 0;
    }
  }

  @keyframes _KubeGems-Reverse {
    100% {
      position: absolute;
      width: 16.67%;
      bottom: 0;
      left: 0%;
    }

    75% {
      position: absolute;
      width: 29.17%;
      left: 0%;
    }

    50% {
      position: absolute;
      width: 41.67%;
      left: 0%;
    }

    25% {
      position: absolute;
      width: 54.17%;
      left: 0%;
    }

    0% {
      position: absolute;
      width: 66.67%;
      left: 0;
    }
  }

  .ObserveGems {
    animation-name: _ObserveGems;
    animation-duration: 0.3s;
    animation-timing-function: ease-out;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  .ObserveGems-Reverse {
    animation-name: _ObserveGems-Reverse;
    animation-duration: 0.3s;
    animation-timing-function: ease-out;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  @keyframes _ObserveGems {
    0% {
      position: absolute;
      width: 16.67%;
      left: 16.67%;
    }

    25% {
      position: absolute;
      // width: 29.17%;
      width: 37.5025%;
      left: 12.5075%;
    }

    50% {
      position: absolute;
      // width: 41.67%;
      width: 58.335%;
      left: 8.345%;
    }

    75% {
      position: absolute;
      // width: 54.17%;
      width: 79.1675%;
      left: 4.1825%;
    }

    100% {
      position: absolute;
      // width: 66.67%;
      width: 100%;
      left: 0;
    }
  }

  @keyframes _ObserveGems-Reverse {
    100% {
      position: absolute;
      width: 16.67%;
      left: 16.67%;
    }

    75% {
      position: absolute;
      width: 29.17%;
      left: 12.5075%;
    }

    50% {
      position: absolute;
      width: 41.67%;
      left: 8.345%;
    }

    25% {
      position: absolute;
      width: 54.17%;
      left: 4.1825%;
    }

    0% {
      position: absolute;
      width: 66.67%;
      left: 0;
    }
  }

  .EdgeGems {
    animation-name: _EdgeGems;
    animation-duration: 0.3s;
    animation-timing-function: ease-out;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  .EdgeGems-Reverse {
    animation-name: _EdgeGems-Reverse;
    animation-duration: 0.3s;
    animation-timing-function: ease-out;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  @keyframes _EdgeGems {
    0% {
      position: absolute;
      width: 16.67%;
      left: 33.34%;
    }

    25% {
      position: absolute;
      // width: 29.17%;
      width: 37.5025%;
      left: 25.005%;
    }

    50% {
      position: absolute;
      // width: 41.67%;
      width: 58.335%;
      left: 16.67%;
    }

    75% {
      position: absolute;
      // width: 54.17%;
      width: 79.1675%;
      left: 8.335%;
    }

    100% {
      position: absolute;
      // width: 66.67%;
      width: 100%;
      left: 0;
    }
  }

  @keyframes _EdgeGems-Reverse {
    100% {
      position: absolute;
      width: 16.67%;
      left: 33.34%;
    }

    75% {
      position: absolute;
      width: 29.17%;
      left: 25.005%;
    }

    50% {
      position: absolute;
      width: 41.67%;
      left: 16.67%;
    }

    25% {
      position: absolute;
      width: 54.17%;
      left: 8.335%;
    }

    0% {
      position: absolute;
      width: 66.67%;
      left: 0;
    }
  }

  .AIGems {
    animation-name: _AIGems;
    animation-duration: 0.3s;
    animation-timing-function: ease-out;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  .AIGems-Reverse {
    animation-name: _AIGems-Reverse;
    animation-duration: 0.3s;
    animation-timing-function: ease-out;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  @keyframes _AIGems {
    0% {
      position: absolute;
      width: 16.67%;
      left: 50.01%;
    }

    25% {
      position: absolute;
      // width: 29.17%;
      width: 37.5025%;
      left: 37.5075%;
    }

    50% {
      position: absolute;
      // width: 41.67%;
      width: 58.335%;
      left: 25.005%;
    }

    75% {
      position: absolute;
      // width: 54.17%;
      width: 79.1675%;
      left: 12.5025%;
    }

    100% {
      position: absolute;
      // width: 66.67%;
      width: 100%;
      left: 0;
    }
  }

  @keyframes _AIGems-Reverse {
    100% {
      position: absolute;
      width: 16.67%;
      left: 50.01%;
    }

    75% {
      position: absolute;
      width: 29.17%;
      left: 37.5075%;
    }

    50% {
      position: absolute;
      width: 41.67%;
      left: 25.005%;
    }

    25% {
      position: absolute;
      width: 54.17%;
      left: 12.5025%;
    }

    0% {
      position: absolute;
      width: 66.67%;
      left: 0;
    }
  }

  .Enter {
    animation-name: _Enter;
    animation-duration: 0.3s;
    animation-timing-function: ease-out;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  @keyframes _Enter {
    0% {
      position: absolute;
      width: 66.67%;
      left: 0;
    }

    25% {
      position: absolute;
      width: 75.0025%;
      left: 0;
    }

    50% {
      position: absolute;
      width: 83.335%;
      left: 0;
    }

    75% {
      position: absolute;
      width: 91.6675%;
      left: 0;
    }

    100% {
      position: absolute;
      width: 100%;
      left: 0;
    }
  }

  .setting {
    &__btn {
      bottom: 20px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }
  }

  .tip {
    line-height: 40px;
  }

  .Fadein {
    animation-name: _Fadein;
    animation-duration: 1.2s;
    animation-timing-function: linear;
    animation-delay: 0s;
    animation-fill-mode: forwards;
  }

  @keyframes _Fadein {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  .user-setting {
    position: absolute;
    margin-left: 4px;
    margin-top: 8px;
  }

  .ribbon {
    background-color: #1890ff;
    overflow: hidden;
    white-space: nowrap;
    position: absolute;
    right: -40px;
    top: 30px;
    transform: rotate(45deg);
    box-shadow: 0 0 10px #888888;
  }

  .ribbon:hover {
    background-color: #0c76d9;
    box-shadow: 0 0 15px #888888;
  }

  .ribbon span {
    border: 1px solid #1890ff;
    color: #ffffff;
    display: block;
    font: bold 100% 'kubegems-sample', Helvetica, Arial, sans-serif;
    margin: 1px 0;
    padding: 5px 50px;
    text-align: center;
    text-shadow: 0 0 5px #444444;
  }
</style>
