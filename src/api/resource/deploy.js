import axios from 'axios';

// 环境下应用镜像列表
export const getEnvironmentAppImageList = (tenantid, projectid, environmentid, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/_/images`, {
    params: query,
  });
// 部署环境下应用镜像
export const postDeployEnvironmentAppImages = (tenantid, projectid, environmentid, body = {}) =>
  axios.post(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/_/images`, body);
// 应用镜像tag
export const getAppImageTags = (tenantid, projectid, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/images/tags`, {
    params: query,
  });
// 部署应用状态
export const getDeployEnvironmentAppsStatus = (tenantid, projectid, environmentid = null, name, query = {}) =>
  axios(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/argohistory`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/argohistory`,
    { params: query },
  );
// 应用镜像部署追踪
export const getDeployEnvironmentAppImageTrace = (tenantid, projectid, environmentid = null, name, query = {}) =>
  axios(
    environmentid
      ? `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/imagehistory`
      : `tenant/${tenantid}/project/${projectid}/manifests/${name}/imagehistory`,
    {
      params: query,
    },
  );
// 策略部署分析模版
export const getStrategyDeployEnvironmentAppsAnalysisTempalte = (
  tenantid,
  projectid,
  environmentid,
  name,
  query = {},
) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/analysistemplate`, {
    params: query,
  });
// 策略部署应用详情
export const getStrategyDeployEnvironmentAppsDetail = (tenantid, projectid, environmentid, name, query = {}) =>
  axios(`tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/strategydeploy`, {
    params: query,
  });
// 策略部署
export const postStrategyDeployEnvironmentApps = (tenantid, projectid, environmentid, name, body = {}) =>
  axios.post(
    `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/strategydeploy`,
    body,
  );
// 策略部署控制
export const postStrategyDeployEnvironmentAppsControl = (tenantid, projectid, environmentid, name, body = {}) =>
  axios.post(
    `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/strategydeploycontrol`,
    body,
  );
// 切换策略部署
export const postSwitchDeployAppStrategy = (tenantid, projectid, environmentid, name, body = {}) =>
  axios.post(
    `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/strategyswitch`,
    body,
  );
// 部署状态
export const getStrategyDeployStatus = (tenantid, projectid, environmentid, name, query = {}) =>
  axios(
    `tenant/${tenantid}/project/${projectid}/environment/${environmentid}/applications/${name}/strategydeploystatus`,
    { params: query },
  );
