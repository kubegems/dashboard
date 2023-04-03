import axios from 'axios';

// 所有应用manifest列表
export const getAllManifest = (query: { [key: string]: any } = {}): Promise<{ [key: string]: any }> =>
  axios(`tenant/_/project/_/manifests`, {
    params: Object.assign(query, {
      preload: 'Project,Creator',
    }),
  });
// Manifest列表
export const getManifestList = (
  tenantid: number,
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/manifests`, {
    params: Object.assign(query, {
      preload: 'Project,Creator',
    }),
  });
// Manifest详情
export const getManifestDetail = (
  tenantid: number,
  projectid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/manifests/${name}`, {
    params: Object.assign(query, {
      preload: 'Project,Creator',
    }),
  });
// 添加Manifest
export const postAddManifest = (
  tenantid: number,
  projectid: number,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.post(`tenant/${tenantid}/project/${projectid}/manifests`, body);
// 更新Manifest
export const putUpdateManifest = (
  tenantid: number,
  projectid: number,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> => axios.put(`tenant/${tenantid}/project/${projectid}/manifests/${name}`, body);
// 删除Manifest
export const deleteManifest = (tenantid, projectid, name): Promise<{ [key: string]: any }> =>
  axios.delete(`tenant/${tenantid}/project/${projectid}/manifests/${name}`);
// 资源文件列表
export const getAppResourceFiles = (
  tenantid: number,
  projectid: number,
  environmentid: number | null = null,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/files`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/files`,
    { params: query },
  );
// 更新资源文件
export const patchAppResourceFile = (
  tenantid: number,
  projectid: number,
  environmentid: number | null = null,
  name: string,
  filename: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.put(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/files/${filename}`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/files/${filename}`,
    body,
  );
// 删除资源文件
export const deleteAppResourceFile = (
  tenantid: number,
  projectid: number,
  environmentid: number | null = null,
  name: string,
  filename: string,
): Promise<{ [key: string]: any }> =>
  axios.delete(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/files/${filename}`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/files/${filename}`,
  );
// 资源文件历史
export const getAppResourceFileHistorys = (
  tenantid: number,
  projectid: number,
  environmentid: number | null = null,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/gitlog`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/gitlog`,
    {
      params: query,
    },
  );
// 资源文件diff
export const getAppResourceFileDiff = (
  tenantid: number,
  projectid: number,
  environmentid: number | null = null,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/gitdiff`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/gitdiff`,
    { params: query },
  );
// 回滚资源文件
export const postRollbackAppResourceFile = (
  tenantid: number,
  projectid: number,
  environmentid: number | null = null,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/gitrevert`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/gitrevert`,
    {},
    { params: query },
  );
// 资源文件meta
export const getAppResourceFileMetas = (
  tenantid: number,
  projectid: number,
  environmentid: number | null = null,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/metas`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/metas`,
    { params: query },
  );
// 镜像安全报告列表
export const getAppImageSecurityReportList = (
  tenantid: number,
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/images/summary`, {
    params: query,
  });
// 镜像安全报告详情
export const getAppImageSecurityReportDetail = (
  tenantid: number,
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios(`tenant/${tenantid}/project/${projectid}/images/vulnerabilities`, {
    params: query,
  });
// 发布镜像
export const putSetPublishAppImage = (
  tenantid: number,
  projectid: number,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.put(`tenant/${tenantid}/project/${projectid}/images/unpublishable`, {}, { params: query });
// 同步资源文件
export const postSyncAppResource = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/sync`, body);
// 刷新资源文件
export const postRefreshAppResource = (
  tenantid: number,
  projectid: number,
  environmentid: number | null = null,
  name: string,
  body: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.post(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/gitpull`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/gitpull`,
    body,
  );
// 移除资源
export const deleteAppResource = (
  tenantid: number,
  projectid: number,
  environmentid: number,
  name: string,
  query: { [key: string]: any } = {},
): Promise<{ [key: string]: any }> =>
  axios.delete(
    `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/argoresource`,
    { params: query },
  );
