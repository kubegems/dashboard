import axios from 'axios';

// 所有应用manifest列表
export const getAllManifest = (query = {}) =>
  axios(`tenant/_/project/_/manifests`, {
    params: Object.assign(query, {
      preload: 'Project,Creator',
    }),
  });
// Manifest列表
export const getManifestList = (tenantid, projectid, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/manifests`, {
    params: Object.assign(query, {
      preload: 'Project,Creator',
    }),
  });
// Manifest详情
export const getManifestDetail = (tenantid, projectid, name, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/manifests/${name}`, {
    params: Object.assign(query, {
      preload: 'Project,Creator',
    }),
  });
// 添加Manifest
export const postAddManifest = (tenantid, projectid, body = {}) =>
  axios.post(`tenant/${tenantid}/project/${projectid}/manifests`, body);
// 更新Manifest
export const putUpdateManifest = (tenantid, projectid, name, body = {}) =>
  axios.put(`tenant/${tenantid}/project/${projectid}/manifests/${name}`, body);
// 删除Manifest
export const deleteManifest = (tenantid, projectid, name) =>
  axios.delete(`tenant/${tenantid}/project/${projectid}/manifests/${name}`);
// 资源文件列表
export const getAppResourceFiles = (tenantid, projectid, environmentid = null, name, query = {}) =>
  axios(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/files`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/files`,
    { params: query },
  );
// 更新资源文件
export const patchAppResourceFile = (tenantid, projectid, environmentid = null, name, filename, body = {}) =>
  axios.put(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/files/${filename}`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/files/${filename}`,
    body,
  );
// 删除资源文件
export const deleteAppResourceFile = (tenantid, projectid, environmentid = null, name, filename) =>
  axios.delete(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/files/${filename}`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/files/${filename}`,
  );
// 资源文件历史
export const getAppResourceFileHistorys = (tenantid, projectid, environmentid = null, name, query = {}) =>
  axios(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/gitlog`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/gitlog`,
    {
      params: query,
    },
  );
// 资源文件diff
export const getAppResourceFileDiff = (tenantid, projectid, environmentid = null, name, query = {}) =>
  axios(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/gitdiff`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/gitdiff`,
    { params: query },
  );
// 回滚资源文件
export const postRollbackAppResourceFile = (tenantid, projectid, environmentid = null, name, query = {}) =>
  axios.post(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/gitrevert`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/gitrevert`,
    {},
    { params: query },
  );
// 资源文件meta
export const getAppResourceFileMetas = (tenantid, projectid, environmentid = null, name, query = {}) =>
  axios(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/metas`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/metas`,
    { params: query },
  );
// 镜像安全报告列表
export const getAppImageSecurityReportList = (tenantid, projectid, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/images/summary`, {
    params: query,
  });
// 镜像安全报告详情
export const getAppImageSecurityReportDetail = (tenantid, projectid, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/images/vulnerabilities`, {
    params: query,
  });
// 发布镜像
export const putSetPublishAppImage = (tenantid, projectid, query = {}) =>
  axios.put(`tenant/${tenantid}/project/${projectid}/images/unpublishable`, {}, { params: query });
// 同步资源文件
export const postSyncAppResource = (tenantid, projectid, environmentid, name, body = {}) =>
  axios.post(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/sync`, body);
// 刷新资源文件
export const postRefreshAppResource = (tenantid, projectid, environmentid = null, name, body = {}) =>
  axios.post(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/gitpull`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/gitpull`,
    body,
  );
// 移除资源
export const deleteAppResource = (tenantid, projectid, environmentid, name, query) =>
  axios.delete(
    `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/argoresource`,
    { params: query },
  );
