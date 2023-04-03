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
import introJs from 'intro.js';
import 'intro.js/introjs.css';

import { useGlobalI18n } from '../i18n';

const i18n = useGlobalI18n();

const intro = introJs();
intro.setOptions({
  nextLabel: i18n.t('intro.next'),
  prevLabel: i18n.t('intro.previous'),
  skipLabel: i18n.t('intro.over'),
  doneLabel: i18n.t('intro.done'),
  hidePrev: true,
  hideNext: false,
  exitOnOverlayClick: false,
  showStepNumbers: false,
  disableInteraction: false,
  showBullets: false,
  buttonClass: 'v-btn v-btn--text theme--light v-size--small',
  exitOnEsc: true,
});

export default intro;
