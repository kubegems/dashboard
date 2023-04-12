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
export const RESOURCE_CN: { [key: string]: string } = {
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
export const RESOURCE_EN: { [key: string]: string } = {
  applications: 'app',
  node: 'node',
  'count/deployments.apps': 'deployment',
  'count/statefulsets.apps': 'statefulset',
  'count/daemonsets.apps': 'daemonset',
  pods: 'pod',
  'count/services': 'service',
  'count/jobs.batch': 'job',
  'count/cronjobs.batch': 'cronjob',
  'count/configmaps': 'configmap',
  'count/secrets': 'secret',
  'count/persistentvolumeclaims': 'persistentvolumeclaim',
};
export const RESOURCE_ICON: { [key: string]: string } = {
  applications: 'mdi-apps',
  node: 'mdi-desktop-classic',
  'count/deployments.apps': 'mdi-calendar-refresh',
  'count/statefulsets.apps': 'mdi-vector-arrange-above',
  'count/daemonsets.apps': 'mdi-vector-difference-ba',
  pods: 'mdi-cube',
  'count/services': 'mdi-lan',
  'count/jobs.batch': 'mdi-calendar-check',
  'count/cronjobs.batch': 'mdi-calendar-sync',
  'count/configmaps': 'mdi-cog-outline',
  'count/secrets': 'mdi-key',
  'count/persistentvolumeclaims': 'mdi-database',
  cpu: 'mdi-cpu-64-bit',
  storage: 'mdi-sd',
  memory: 'mdi-nas',
};
export const K8S_RESOURCE_ICON: { [key: string]: string } = {
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

export const ANNOTATION_IGNORE_ARRAY: any[] = [
  'kubectl.kubernetes.io/last-applied-configuration',
  'banzaicloud.com/last-applied',
];
export const APP_MENIFEST_TAG: { [key: string]: { [key: string]: string | boolean } } = {
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
export const ARGO_STATUS_COLOR: { [key: string]: string } = {
  Degraded: '#ff5252',
  Unknown: '#607D8B',
  Progressing: '#fb8c00',
  Healthy: '#00BCD4',
  Suspended: '#4CAF50',
  Missing: '#9E9E9E',
  NoArgoApp: '#607D8B',
};
export const APP_TASK_STATUS_COLOR: { [key: string]: string } = {
  Pending: '#fb8c00',
  Running: '#fb8c00',
  Success: '#4CAF50',
  Error: '#ff5252',
  Unknown: '#607D8B',
};
export const ARGO_ROLLOUT_STATUS_COLOR: { [key: string]: string } = {
  Unknown: '#607D8B',
  Progressing: '#fb8c00',
  Degraded: '#ff5252',
  Healthy: '#00BCD4',
  Paused: '#4CAF50',
};
export const POD_STATUS_COLOR: { [key: string]: string } = {
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
export const CONTAINER_STATUS_COLOR: { [key: string]: string } = {
  Running: '#00BCD4',
  Waiting: '#fb8c00',
  Terminated: '#607D8B',
  Failed: '#ff5252',
  Unknown: '#9E9E9E',
};
export const PVC_STATUS_COLOR: { [key: string]: string } = {
  true: '#00BCD4',
  false: '#607D8B',
  undefined: '#ff5252',
};
export const WORKLOAD_STATUS_COLOR: { [key: string]: string } = {
  ready: '#00BCD4',
  pending: '#fb8c00',
};
export const EVENT_STATUS_COLOR: { [key: string]: string } = {
  Normal: 'success',
  Warning: 'warning',
};

export const MODEL_FRAMEWORK: string[] = [
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
  'tensorflow',
];

export const TRACK_API: string[] = [
  'login',
  'my/info',
  'my/auth',
  '/oauth/callback',
  '/oauth/addr',
  'system/authsource',
  'plugins',
  'proxy/cluster/.+/plugins',
  'proxy/cluster/.+/custom/prometheus/v1/matrix',
  'proxy/cluster/.+/custom/prometheus/v1/vector',
  'message',
];
