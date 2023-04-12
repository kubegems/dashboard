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
import * as audit from './audit';
import * as auth from './auth';
import * as broadcast from './broadcast';
import * as cluster from './cluster';
import * as edgeCluster from './edge_cluster';
import * as edgeHub from './edge_hub';
import * as environment from './environment';
import * as kubernetes from './kubernetes';
import * as message from './message';
import * as namespace from './namespace';
import * as oauth from './oauth';
import * as plugin from './plugin';
import * as project from './project';
import * as role from './role';
import * as tenant from './tenant';
import * as user from './user';
import * as version from './version';
import * as virtualSpace from './virtualspace';

export default {
  auth,
  audit,
  cluster,
  environment,
  message,
  oauth,
  plugin,
  project,
  role,
  tenant,
  user,
  version,
  virtualSpace,
  broadcast,
  edgeCluster,
  edgeHub,
  kubernetes,
  namespace,
};
