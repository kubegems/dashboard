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
export const PROJECT_ROLE: { [key: string]: string } = {
  dev: '研发',
  test: '测试',
  ops: '运维',
  admin: '管理员',
  sys: '系统管理员',
  tenantadmin: '租户管理员',
};

export const RESOURCE_ROLE: { [key: string]: string } = {
  operator: '操作成员',
  reader: '只读成员',
  sys: '系统管理员',
  tenantadmin: '租户管理员',
  projectadmin: '项目管理员',
  projectops: '项目运维',
};

export const TENANT_ROLE: { [key: string]: string } = {
  ordinary: '普通成员',
  admin: '管理员',
  sys: '系统管理员',
};

export const VIRTUALSPACE_ROLE: { [key: string]: string } = {
  normal: '普通成员',
  admin: '管理员',
  sys: '系统管理员',
};

export const VENDOR: { [key: string]: string } = {
  kubegems: 'Kubegems',
  oauth: 'Oauth',
  ldap: 'Ldap',
  gitlab: 'GitLab',
  github: 'GitHub',
  selfhosted: 'Selfhosted',
};

export const METATYPE_CN: { [key: string]: { [key: string]: string } } = {
  dev: { cn: '开发', color: 'primary' },
  test: { cn: '测试', color: 'warning' },
  prod: { cn: '生产', color: 'success' },
};
