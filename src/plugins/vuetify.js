import Vue from 'vue';
import Vuetify from 'vuetify';
import '@/scss/vuetify/overrides.scss';
Vue.use(Vuetify);

const theme = {
  primary: '#1e88e5',
  info: '#1e88e5',
  success: '#00BCD4',
  accent: '#fc4b6c',
  default: '#563dea',
};

export default new Vuetify({
  theme: {
    themes: {
      dark: theme,
      light: theme,
    },
  },
});
