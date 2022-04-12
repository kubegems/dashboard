import Vue from 'vue'
import App from './App'
import vuetify from './plugins/vuetify'
import router from './router'
import store from '@/store'
import moment from 'moment'
import yaml from 'js-yaml'
import _ from 'lodash'
import ACEEditor from 'vue2-ace-editor'
import VueSlider from 'vue-slider-component'
import VuePageTitle from 'vue-page-title'
import { VueOkrTree } from 'vue-okr-tree'
import { Icon } from '@iconify/vue2'
import './plugins/base'
import 'github-markdown-css/github-markdown.css'
import 'vue-okr-tree/dist/vue-okr-tree.css'
import 'vue-slider-component/theme/default.css'
import './assets/styles/index.scss'
import c from '@/plugins/const'
import * as Sentry from '@sentry/vue'
import { Integrations } from '@sentry/tracing'

// 自定义指令
import directives from './directives'

Vue.component('Icon', Icon)
Vue.component('ACEEditor', ACEEditor)
Vue.component('VueOkrTree', VueOkrTree)
Vue.component('VueSlider', VueSlider)

moment.locale('zh-cn')
Vue.prototype.$moment = moment
Vue.prototype.$yaml = yaml
Vue.prototype.$yamlload = (data) => {
  try {
    const d = yaml.load(data)
    return d
  } catch (e) {
    store.commit('SET_SNACKBAR', {
      text: e.reason,
      color: 'warning',
    })
    return null
  }
}
Vue.prototype.$yamldump = (data) => {
  try {
    const d = yaml.dump(data)
    return d
  } catch (e) {
    store.commit('SET_SNACKBAR', {
      text: e.reason,
      color: 'warning',
    })
    return null
  }
}
Vue.prototype.$_ = _
Vue.config.productionTip = false
Vue.prototype.$aceOptions = {
  tabSize: 2,
  fontSize: 12,
  printMarginColumn: 100,
  showPrintMargin: false,
  wrap: true,
  readOnly: false,
}
Vue.prototype.$aceinit = () => {
  require('brace/theme/chrome')
  require('brace/ext/language_tools')
  require('brace/ext/searchbox')
  require('brace/ext/beautify')
  require('brace/mode/yaml')
  require('brace/mode/json')
  require('brace/mode/plain_text')
  require('brace/snippets/json')
}

Vue.use(VuePageTitle, {
  router: router,
  suffix: ' - KubeGems',
})
Vue.use(directives)
Vue.use(c)

// conf if necessary
if (process.env.VUE_APP_SENTRY === 'true') {
  Sentry.init({
    Vue,
    dsn: process.env.VUE_APP_SENTRY_DSN,
    release:
      process.env.VUE_APP_RELEASE &&
        process.env.VUE_APP_RELEASE.indexOf('v') === 0
        ? process.env.VUE_APP_RELEASE
        : 'develop',
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: [`kubegems.io`, /^\//],
      }),
    ],
    initialScope: {
      tags: { username: store.state.User.Username },
    },
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
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
    beforeSend(event, hint) {
      const error = hint.originalException
      if (
        error &&
        error.message &&
        error.message.match(
          new RegExp(
            '400|401|403|404|408|409|422|500|502|503|504|token过期|参数错误|Loading chunk|Unexpected token',
            'g',
          ),
        )
      ) {
        return null
      }
      return event
    },
  })
}

// eslint-disable-next-line vue/require-name-property
new Vue({
  vuetify,
  store,
  router,
  render: (h) => h(App),
}).$mount('#app')
