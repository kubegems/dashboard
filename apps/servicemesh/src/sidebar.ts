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
import management from '@kubegems/platform/sidebar';

export const SIDEBAR_ITEMS: { [key: string]: string | boolean | string[] }[] = [
  {
    text: 'microservice',
    sidebar: 'microservice',
    value: 'microservice',
    icon: 'mdi:arrow-decision',
    dependencies: [],
    admin: 'all',
  },
  {
    text: 'microservice',
    sidebar: 'virtualspace',
    value: 'microservice',
    icon: 'mdi:arrow-decision',
    required: ['virtualspace'],
    dependencies: [],
  },
].concat(management as any[]);
