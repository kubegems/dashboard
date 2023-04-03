import './ace';
import './guide';
import './moment';
import './sentry';
import './tracing';
import './yaml';
import _ from 'lodash';
import Vue from 'vue';

import VueClipboard from 'vue-clipboard2';
import VueMeta from 'vue-meta';

Vue.prototype.$_ = _;

Vue.use(VueMeta);
Vue.use(VueClipboard);
