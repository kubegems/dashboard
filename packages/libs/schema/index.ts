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
import authorizationpolicy from './authorizationpolicy';
import certificate from './certificate';
import configmap from './configmap';
import cronjob from './cronjob';
import destinationrule from './destinationrule';
import flow from './flow';
import gateway from './gateway';
import ingress from './ingress';
import issuer from './issuer';
import job from './job';
import output from './output';
import peerauthentication from './peerauthentication';
import persistentvolumeclaim from './persistentvolumeclaim';
import secret from './secret';
import service from './service';
import serviceentry from './serviceentry';
import servicemonitor from './servicemonitor';
import sidecar from './sidecar';
import tenantgateway from './tenantgateway';
import virtualservice from './virtualservice';
import workload from './workload';

export default {
  authorizationpolicy,
  certificate,
  configmap,
  cronjob,
  destinationrule,
  flow,
  gateway,
  ingress,
  issuer,
  job,
  output,
  peerauthentication,
  persistentvolumeclaim,
  secret,
  service,
  serviceentry,
  servicemonitor,
  sidecar,
  tenantgateway,
  virtualservice,
  workload,
};
