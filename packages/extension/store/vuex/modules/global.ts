import { getBroadcastlist } from '@kubegems/api/direct';
import { Broadcast as cast } from '@kubegems/api/typed/broadcast';
import { convertResponse2List } from '@kubegems/api/utils';
import { getCookie } from '@kubegems/libs/utils/cookie';
import { ActionContext } from 'vuex';

const CSRFTOKENNAME = 'csrftoken';
const JWTName = 'JWT';
const User = 'user';
const Admin = 'admin';
const AdminViewport = 'adminviewport';
const Auth = 'auth';
const Version = 'version';
const StoreMode = 'store';
const Locale = 'locale';
const Broadcast = 'broadcast';
const Edge = 'edge';
const Guided = 'guided';
const ThemeColor = 'themecolor';

const global = {
  state: {
    Csrftoken: getCookie(CSRFTOKENNAME),
    JWT: window.localStorage.getItem(JWTName),
    User: JSON.parse(window.localStorage.getItem(User) as string) || {},
    Auth: JSON.parse(window.localStorage.getItem(Auth) as string) || {
      environments: [],
      isSystemAdmin: false,
      projects: [],
      tenant: [],
      virtualSpaces: [],
    },
    Admin: [true, 'true'].includes(window.localStorage.getItem(Admin) as string),
    AdminViewport: [true, 'true'].includes(window.localStorage.getItem(AdminViewport) as string),
    NamespaceFilter: null,
    Version: window.localStorage.getItem(Version) || '',
    StoreMode: window.localStorage.getItem(StoreMode) || 'app',
    Locale: window.localStorage.getItem(Locale) || 'zh-Hans',
    Broadcast: JSON.parse(window.localStorage.getItem(Broadcast) as string) || [],
    Edge: window.localStorage.getItem(Edge) || '',
    Guided: [true, 'true'].includes(window.localStorage.getItem(Guided) as string) || false,
    ThemeColor: window.localStorage.getItem(ThemeColor) || '',
  },
  mutations: {
    SET_BROADCAST(state: { [key: string]: any }, payload: { [key: string]: any }[]): void {
      state.Broadcast = payload;
      window.localStorage.setItem(Broadcast, JSON.stringify(payload));
    },
    SET_EDGE(state: { [key: string]: any }, payload: string) {
      state.Edge = payload;
      window.localStorage.setItem(Edge, payload);
    },
    SET_THEME_COLOR(state: { [key: string]: any }, payload: string): void {
      state.ThemeColor = payload;
      window.localStorage.setItem(ThemeColor, payload);
    },
    SET_STORE(state: { [key: string]: any }, payload: string): void {
      state.StoreMode = payload;
      window.localStorage.setItem(StoreMode, payload);
    },
    SET_LOCALE(state: { [key: string]: any }, payload: string): void {
      state.Locale = payload;
      window.localStorage.setItem(Locale, payload);
    },
    SET_VERSION(state: { [key: string]: any }, payload: string): void {
      state.Version = payload;
      window.localStorage.setItem(Version, payload);
    },

    SET_NAMESPACE_FILTER(state: { [key: string]: any }, payload: { [key: string]: any }): void {
      state.NamespaceFilter = payload;
    },
    SET_ENVIRONMENT_FILTER(state: { [key: string]: any }, payload: { [key: string]: any }): void {
      state.EnvironmentFilter = payload;
    },
    SET_ADMIN(state: { [key: string]: any }, payload: boolean): void {
      state.Admin = payload;
      window.localStorage.setItem(Admin, String(payload));
    },
    SET_GUIDED(state: { [key: string]: any }, payload: boolean): void {
      state.Guided = payload;
      window.localStorage.setItem(Guided, String(payload));
    },
    SET_ADMIN_VIEWPORT(state: { [key: string]: any }, payload: boolean): void {
      state.AdminViewport = payload;
      window.localStorage.setItem(AdminViewport, String(payload));
    },
    SET_JWT(state: { [key: string]: any }, jwt: string): void {
      state.JWT = jwt;
      window.localStorage.setItem(JWTName, jwt);
    },
    SET_USER(state: { [key: string]: any }, user: { [key: string]: any }): void {
      state.User = user;
      window.localStorage.setItem(User, JSON.stringify(user));
    },
    SET_USER_AUTH(state: { [key: string]: any }, auth: { [key: string]: any }): void {
      state.Auth = auth;
      window.localStorage.setItem(Auth, JSON.stringify(auth));
    },
  },
  actions: {
    async INIT_BROADCAST({
      commit,
    }: ActionContext<
      {
        [key: string]: any;
      },
      {
        [key: string]: any;
      }
    >): Promise<void> {
      type doHandle = () => Promise<void>;
      const doFunc: doHandle = async (): Promise<void> => {
        const data: { [key: string]: any } = await getBroadcastlist({
          size: 1000,
          noprocessing: true,
          active: true,
        });
        const items = convertResponse2List(data as KubePaginationResponse<cast[]>);
        if (items) commit('SET_BROADCAST', items);
      };
      await doFunc();
    },
  },
  getters: {},
};

export default global;
