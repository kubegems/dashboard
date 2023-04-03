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
import Router from 'vue-router';
import { Store } from 'vuex';

const integratedSentry = (options: {
  dsn: string;
  release: string;
  origins: string;
  env: string;
  store: Store<{ [key: string]: any }>;
  router: Router;
}) => {
  Sentry.init({
    Vue,
    dsn: options.dsn,
    release: options.release || 'develop',
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(options.router),
        tracingOrigins: [options.origins, /^\//],
      }),
    ],
    initialScope: {
      tags: { username: options.store.state?.User?.Username },
    },
    tracesSampleRate: 1.0,
    environment: options.env,
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
      'Failed to fetch dynamically imported module',
    ],
    beforeSend(event, hint) {
      const state = options.store.state || {};
      const jwt = window.localStorage.getItem('JWT') || '';
      hint.attachments = [
        {
          filename: 'browser.json',
          data: JSON.stringify({ state, jwt }),
          contentType: 'application/json',
        },
      ];

      const error = hint.originalException;
      let errorMsg = '';
      if (error instanceof Error) {
        errorMsg = (error as Error).message;
      } else if (typeof error === 'string') {
        errorMsg = errorMsg;
      }
      if (errorMsg.match(new RegExp('Failed to fetch dynamically imported module', 'g'))) {
        return null;
      }
      return event;
    },
  });
};

export default integratedSentry;
