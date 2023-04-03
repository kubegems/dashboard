import Vue, { computed } from 'vue';
import Router, { RawLocation, Route, RouteMeta } from 'vue-router';

Vue.use(Router);

type routerHandler = (_: RawLocation) => Promise<Route>;

const originalPush: routerHandler = Router.prototype.push;
Router.prototype.push = (location: RawLocation): Promise<Route> => {
  return originalPush.call(router, location).catch((err) => err);
};

const originalReplace: routerHandler = Router.prototype.replace;
Router.prototype.replace = (location: RawLocation): Promise<Route> => {
  return originalReplace.call(router, location).catch((err) => err);
};

const router: Router = new Router({
  mode: 'history',
  routes: [],
});

type Dictionary<T> = { [key: string]: T };
const routeData = Vue.observable({ params: {}, query: {}, path: '', name: '', meta: {} });
router.afterEach((route) => {
  routeData.params = route.params;
  routeData.query = route.query;
  routeData.path = route.path;
  routeData.name = route.name as string;
  routeData.meta = route.meta as any;
});
export const useParams = () => {
  return computed<Dictionary<string>>(() => routeData.params);
};
export const useQuery = () => {
  return computed<Dictionary<string>>(() => routeData.query);
};
export const usePath = () => {
  return computed<string>(() => routeData.path);
};
export const useName = () => {
  return computed<string>(() => routeData.name);
};
export const useMeta = () => {
  return computed<RouteMeta>(() => routeData.meta);
};

export const useRouter = () => router;

export default router;
