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
    <div>
      <MessageBarChart :data="data" :date="date" />
    </div>
    <div class="my-8" />
    <div class="d-flex justify-space-around">
      <div class="kubegems__h-24 kubegems__w-11">
        <EventPieChart :data="data" :title="$t('tip.event_source')" type="source_component" />
      </div>
      <div class="kubegems__h-24 kubegems__w-11">
        <EventPieChart :data="data" :title="$t('tip.event_type')" type="reason" />
      </div>
    </div>
  </div>
</template>

<script>
  import messages from '../../../../i18n';
  import EventPieChart from './EventPieChart';
  import MessageBarChart from './MessageBarChart';

  export default {
    name: 'Chart',
    i18n: {
      messages: messages,
    },
    components: {
      EventPieChart,
      MessageBarChart,
    },
    props: {
      data: {
        type: Array,
        default: () => [],
      },
      date: {
        type: Array,
        default: () => [],
      },
    },
  };
</script>
