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
import Vue from 'vue';
import ACEEditor from 'vue2-ace-editor';

import 'brace/theme/chrome';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import 'brace/ext/beautify';
import 'brace/mode/yaml';
import 'brace/mode/json';
import 'brace/mode/xml';
import 'brace/mode/ini';
import 'brace/mode/html';
import 'brace/mode/java';
import 'brace/mode/python';
import 'brace/mode/golang';
import 'brace/mode/c_cpp';
import 'brace/mode/csharp';
import 'brace/mode/css';
import 'brace/mode/javascript';
import 'brace/mode/properties';
import 'brace/mode/plain_text';
import 'brace/mode/sass';
import 'brace/mode/scss';
import 'brace/snippets/json';

Vue.component('ACEEditor', ACEEditor);

Vue.prototype.$aceOptions = {
  tabSize: 2,
  fontSize: 12,
  printMarginColumn: 100,
  showPrintMargin: false,
  wrap: true,
  readOnly: false,
};
