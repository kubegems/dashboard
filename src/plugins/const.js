const RESOURCE_CN = {
  applications: '应用',
  node: '节点',
  'count/deployments.apps': '无状态服务',
  'count/statefulsets.apps': '有状态服务',
  'count/daemonsets.apps': '守护进程服务',
  pods: '容器组',
  'count/services': '服务',
  'count/jobs.batch': '任务',
  'count/cronjobs.batch': '定时任务',
  'count/configmaps': '配置',
  'count/secrets': '密钥',
  'count/persistentvolumeclaims': '存储卷',
};
const RESOURCE_ICON = {
  applications: 'mdi:apps',
  node: 'mdi:desktop-classic',
  'count/deployments.apps': 'mdi:calendar-refresh',
  'count/statefulsets.apps': 'mdi:vector-arrange-above',
  'count/daemonsets.apps': 'mdi:vector-difference-ba',
  pods: 'mdi:cube',
  'count/services': 'mdi:lan',
  'count/jobs.batch': 'mdi:calendar-check',
  'count/cronjobs.batch': 'mdi:calendar-sync',
  'count/configmaps': 'mdi:cog-outline',
  'count/secrets': 'mdi:key',
  'count/persistentvolumeclaims': 'mdi:database',
  cpu: 'mdi:cpu-64-bit',
  storage: 'mdi:sd',
  memory: 'mdi:nas',
};
const K8S_RESOURCE_ICON = {
  Node: 'node',
  Deployment: 'deploy',
  StatefulSet: 'sts',
  DaemonSet: 'ds',
  Pod: 'pod',
  Service: 'svc',
  Job: 'job',
  CronJob: 'cronjob',
  ConfigMap: 'cm',
  Secret: 'secret',
  PersistentVolumeClaim: 'pvc',
  ReplicaSet: 'rs',
  PersistentVolume: 'pv',
  Namespace: 'ns',
  CustomResourceDefinition: 'crd',
  Ingress: 'ing',
  Endpoints: 'ep',
  LimitRange: 'limits',
  HorizontalPodAutoscaler: 'hpa',
  ServiceAccount: 'sa',
  PodSecurityPolicy: 'psp',
  NetworkPolicy: 'netpol',
  PodDisruptionBudget: 'pdb',
  StorageClass: 'sc',
  ResourceQuota: 'quota',
  User: 'user',
  Group: 'group',
  Role: 'role',
  ClusterRole: 'c-role',
  ClusterRoleBinding: 'crb',
  RoleBinding: 'rb',
  EndpointSlice: 'es',
  ControllerRevision: 'controllerrevision',
};
export const RESOURCE_SHORT_CN = {
  Deployment: '无状态服务',
  StatefulSet: '有状态服务',
  Daemonset: '守护进程服务',
  Job: '任务',
  CronJob: '定时任务',
};
export const ANNOTATION_IGNORE_ARRAY = [
  'kubectl.kubernetes.io/last-applied-configuration',
  'banzaicloud.com/last-applied',
];
export const APP_MENIFEST_TAG = {
  ConfigMap: { value: 'cm', form: true },
  PersistentVolumeClaim: { value: 'pvc', form: true },
  Secret: { value: 'secret', form: true },
  Service: { value: 'svc', form: true },
  DaemonSet: { value: 'ds', form: true },
  Deployment: { value: 'deploy', form: true },
  StatefulSet: { value: 'sts', form: true },
  CronJob: { value: 'cj', form: true },
  Job: { value: 'job', form: true },
  Ingress: { value: 'ing', form: true },
  Rollout: { value: 'rollout', form: false },
  VirtualService: { value: 'vs', form: false },
  DestinationRule: { value: 'dr', form: false },
  Gateway: { value: 'gw', form: false },
  Sidecar: { value: 'sidecar', form: false },
  ServiceEntry: { value: 'se', form: false },
  PeerAuthentication: { value: 'pa', form: false },
  AuthorizationPolicy: { value: 'ap', form: false },
  HorizontalPodAutoscaler: { value: 'hpa', form: false },
  Error: { value: 'error', form: false },
};
const ARGO_STATUS_COLOR = {
  Degraded: '#ff5252',
  Unknown: '#607D8B',
  Progressing: '#fb8c00',
  Healthy: '#00BCD4',
  Suspended: '#4CAF50',
  Missing: '#9E9E9E',
  NoArgoApp: '#607D8B',
};
const APP_TASK_STATUS_COLOR = {
  Pending: '#fb8c00',
  Running: '#fb8c00',
  Success: '#4CAF50',
  Error: '#ff5252',
  Unknown: '#607D8B',
};
const ARGO_ROLLOUT_STATUS_COLOR = {
  Unknown: '#607D8B',
  Progressing: '#fb8c00',
  Degraded: '#ff5252',
  Healthy: '#00BCD4',
  Paused: '#4CAF50',
};
const POD_STATUS_COLOR = {
  Running: '#00BCD4',
  Completed: '#4CAF50',
  Evicted: '#607D8B',
  Pending: '#fb8c00',
  Failed: '#ff5252',
  Terminating: '#fb8c00',
  CrashLoopBackOff: '#ff5252',
  ContainerCreating: '#fb8c00',
  PodInitializing: '#fb8c00',
  ImagePullBackOff: '#ff5252',
  ErrImagePull: '#ff5252',
  ErrImageNeverPull: '#ff5252',
  Error: '#ff5252',
  CreateContainerConfigError: '#ff5252',
};
const CONTAINER_STATUS_COLOR = {
  Running: '#00BCD4',
  Waiting: '#fb8c00',
  Terminated: '#607D8B',
  Failed: '#ff5252',
};
const NODE_STATUS_COLOR = {
  Ready: '#00BCD4',
  DiskPressure: '#fb8c00',
  MemoryPressure: '#fb8c00',
  PIDPressure: '#fb8c00',
  NetworkUnavailable: '#fb8c00',
};
const PVC_STATUS_COLOR = {
  true: '#00BCD4',
  false: '#607D8B',
  undefined: '#ff5252',
};
const WORKLOAD_STATUS_COLOR = {
  ready: '#00BCD4',
  pending: '#fb8c00',
};
const EVENT_STATUS_COLOR = {
  Normal: 'success',
  Warning: 'warning',
};
const METATYPE_CN = {
  dev: { cn: '开发', color: 'primary' },
  test: { cn: '测试', color: 'warning' },
  prod: { cn: '生产', color: 'success' },
};

const LINE_THEME_COLORS = [
  'rgba(0,188,212,.8)',
  'rgba(0,188,212,.5)',
  'rgba(0,184,220,.8)',
  'rgba(0,184,220,.5)',
  'rgba(0,188,206,.8)',
  'rgba(0,188,206,.5)',
  'rgba(0,184,216,.8)',
  'rgba(0,184,216,.5)',
  'rgba(0,180,222,.8)',
  'rgba(0,180,222,.5)',
  'rgba(0,176,212,.8)',
  'rgba(0,176,212,.5)',
];

const LINE_THEME_FUL_COLORS = [
  '#2196F3',
  '#4CAF50',
  '#FB8C00',
  '#009688',
  '#BA68C8',
  '#EF5350',
  '#9575CD',
  '#F06292',
  '#EF5350',
  '#607D8B',
];

const PROJECT_ROLE = {
  dev: '研发',
  test: '测试',
  ops: '运维',
  admin: '管理员',
  sys: '系统管理员',
  tenantadmin: '租户管理员',
};

const RESOURCE_ROLE = {
  operator: '操作成员',
  reader: '只读成员',
  sys: '系统管理员',
  tenantadmin: '租户管理员',
  projectadmin: '项目管理员',
  projectops: '项目运维',
};

const TENANT_ROLE = {
  ordinary: '普通成员',
  admin: '管理员',
  sys: '系统管理员',
};

const VIRTUALSPACE_ROLE = {
  normal: '普通成员',
  admin: '管理员',
  sys: '系统管理员',
};

const VENDOR = {
  kubegems: 'Kubegems',
  oauth: 'Oauth',
  ldap: 'Ldap',
  gitlab: 'GitLab',
  github: 'GitHub',
  selfhosted: 'Selfhosted',
};

const MODEL_FRAMEWORK = [
  'transformers',
  'pytorch',
  'asteroid',
  'flair',
  'espnet',
  'generic',
  'keras',
  'nemo',
  'spacy',
  'stanza',
  'jax',
  'fastai',
  'diffusers',
  'core ml',
  'onnx',
  'rust',
];

export default {
  install(Vue) {
    Vue.prototype.$RESOURCE_CN = RESOURCE_CN;
    Vue.prototype.$RESOURCE_ICON = RESOURCE_ICON;
    Vue.prototype.$K8S_RESOURCE_ICON = K8S_RESOURCE_ICON;
    Vue.prototype.$RESOURCE_SHORT_CN = RESOURCE_SHORT_CN;
    Vue.prototype.$ANNOTATION_IGNORE_ARRAY = ANNOTATION_IGNORE_ARRAY;
    Vue.prototype.$APP_MENIFEST_TAG = APP_MENIFEST_TAG;
    Vue.prototype.$ARGO_STATUS_COLOR = ARGO_STATUS_COLOR;
    Vue.prototype.$APP_TASK_STATUS_COLOR = APP_TASK_STATUS_COLOR;
    Vue.prototype.$ARGO_ROLLOUT_STATUS_COLOR = ARGO_ROLLOUT_STATUS_COLOR;
    Vue.prototype.$POD_STATUS_COLOR = POD_STATUS_COLOR;
    Vue.prototype.$CONTAINER_STATUS_COLOR = CONTAINER_STATUS_COLOR;
    Vue.prototype.$NODE_STATUS_COLOR = NODE_STATUS_COLOR;
    Vue.prototype.$PVC_STATUS_COLOR = PVC_STATUS_COLOR;
    Vue.prototype.$WORKLOAD_STATUS_COLOR = WORKLOAD_STATUS_COLOR;
    Vue.prototype.$EVENT_STATUS_COLOR = EVENT_STATUS_COLOR;
    Vue.prototype.$METATYPE_CN = METATYPE_CN;
    Vue.prototype.$LINE_THEME_COLORS = LINE_THEME_COLORS;
    Vue.prototype.$PROJECT_ROLE = PROJECT_ROLE;
    Vue.prototype.$RESOURCE_ROLE = RESOURCE_ROLE;
    Vue.prototype.$TENANT_ROLE = TENANT_ROLE;
    Vue.prototype.$VIRTUALSPACE_ROLE = VIRTUALSPACE_ROLE;
    Vue.prototype.$VENDOR = VENDOR;
    Vue.prototype.$LINE_THEME_FUL_COLORS = LINE_THEME_FUL_COLORS;
    Vue.prototype.$MODEL_FRAMEWORK = MODEL_FRAMEWORK;
  },
};
