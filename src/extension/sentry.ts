/*
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
 */
import { Integrations } from '@sentry/tracing';
import * as Sentry from '@sentry/vue';
import Vue from 'vue';

import router from '@/router';
import store from '@/store';

if (import.meta.env.VUE_APP_SENTRY === 'true') {
  Sentry.init({
    Vue,
    dsn: import.meta.env.VUE_APP_DSN,
    release: import.meta.env.VUE_APP_RELEASE || 'develop',
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: [import.meta.env.VUE_APP_ORIGINS, /^\//],
      }),
    ],
    initialScope: {
      tags: { username: store.state.User.Username },
    },
    tracesSampleRate: 1.0,
    environment: import.meta.env.VUE_APP_ENVIRONMENT,
    ignoreErrors: [
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      'fb_xd_fragment',
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      'conduitPage',
    ],
  });
}
