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

// 定制化字段
export const PLATFORM = 'KubeGems';
export const MANUAL = 'https://www.kubegems.io/docs/concepts/what-is-kubegems';
export const LOGO_BLUE = '/logo-blue.svg';
export const LOGO_WHITE = '/logo-white.svg';
