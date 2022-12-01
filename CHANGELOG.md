# 1.23.0-alpha.0 (2022-12-01)

### 🌟 新功能

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | [feat: ✨ support edge cluster] | [05f1759](https://github.com/chenshunliang/dashboard/commit/05f17596aa7a40774f0ac5a41d3ab2392d7d15b7) |

### Bug Fixes

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | [fix: 🐛 fix axios get params space escape bug] | ([28adb0b](https://github.com/chenshunliang/dashboard/commit/28adb0b1ec83559cdd9739dba941752c3ac2d7e3)) |
| - | [fix: 🐛 fix base environment header get data error bug] | ([c1b02f3](https://github.com/chenshunliang/dashboard/commit/c1b02f3867334ebb0f36e53b9610a94b57080775)) |
| - | [fix: 🐛 fix edge proxy no effect in environment space] | ([9170816](https://github.com/chenshunliang/dashboard/commit/9170816180f2f2cc480104ccd4ab0fd47a3aadb4)) |

### 🚀 性能优化

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | [perf: ⚡ add global plugin check for edge pages, fix vue keep-alive bug] | ([7e4c4d0b](https://github.com/chenshunliang/dashboard/commit/7e4c4d0bf32dda3a4e4516b38f5ebc8f130f1e46)) |
| - | [perf: ⚡ support add multiple rule to one monitor chart] | ([c56deaf](https://github.com/chenshunliang/dashboard/commit/c56deafcdb9b2c0835c1f7aecd0f0e52c65bd887)) |

### 🔨 reflactor

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | [refactor: 🔨 reflact base component to composition api style] | ([14cb4d3](https://github.com/chenshunliang/dashboard/commit/14cb4d3b3bf64cbe75a4f844b072f04c4da7db25)) |

# 1.22.2 (2022-11-21)

### Bug Fixes

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | [fix: 🐛 fix monitor dashboard update dashboard name occured global variable error bug] | ([6bb7440](https://github.com/chenshunliang/dashboard/commit/6bb744033769adbe3baa6c665c76bcf81fe626cb)) |

### 🚀 性能优化

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | [perf: ⚡ add base drop select component] | ([1813404](https://github.com/chenshunliang/dashboard/commit/18134040ddfdfd985bdf46f1f0ca240fa449426c)) |
| - | [perf: ⚡ optimization base area chart tooltip style] | ([17f658f](https://github.com/chenshunliang/dashboard/commit/17f658f8759b89dee5e786bfbe84ca85b3e3d2a2)) |
| - | [perf: ⚡ optimization monitor dashboard global variable selector component] | ([187a3bd](https://github.com/chenshunliang/dashboard/commit/187a3bdc683eca6513ac4d5d105ae8fc8268b219)) |

# 1.22.1 (2022-11-17)

### Bug Fixes

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | [fix: 🐛 fix app monitor sort not effect bug] | ([d4d5bce](https://github.com/chenshunliang/dashboard/commit/d4d5bce9fe02dc6c3858c7ae54837d91e2bb031a)) |
| - | [fix: 🐛 fix line chart time series lost bug] | ([6507f56](https://github.com/chenshunliang/dashboard/commit/6507f56d2d7e7fd55802e0e795ed391c5f0bb78b)) |
| - | [🐞 fix(obsv): log detail side chart] | ([1136339](https://github.com/chenshunliang/dashboard/commit/11363396ce9506f40280f74c90285b0c71c09d74)) |
| - | [fix: 🐛 fix app monitor switch service not refresh bug] | ([83f2062](https://github.com/chenshunliang/dashboard/commit/83f2062a408f9005c6e9d432351effcd49e35741)) |

### 🚀 性能优化

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | sync(otel): do not use recording rule | ([45d4255](https://github.com/chenshunliang/dashboard/commit/45d425585a4a7ade89e27f81aacfb7aaa325b673)) |
| - | [perf: ⚡ hide log viewer suggestion | ([e37208b](https://github.com/chenshunliang/dashboard/commit/e37208beb2da648b2efc0186ca5b960a20c8b2e1)) |

# 1.22.0 (2022-11-09)

### Bug Fixes

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | fix: 🐛 fix ingress tls repeat bug, fix log alert template container can not multiple select bug | ([ae19a55](https://github.com/chenshunliang/dashboard/commit/ae19a55449ac61b94fafc86dd6103218644a15b3)) |
| - | fix: 🐛 fix broadcast datetimepicker default value bug | ([8937de8](https://github.com/chenshunliang/dashboard/commit/8937de829a1977c75aa508c5c9c5e0966de28f3a)) |
| - | fix: 🐛 fix alert dashboard statistics error bug | ([fdb5701](https://github.com/chenshunliang/dashboard/commit/fdb57011d8a37e1bb48c248b5a577607477ac59a)) |

### 🚀 性能优化

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | perf: ⚡ add app config preview panel and enhans app config filter | ([e36b061](https://github.com/chenshunliang/dashboard/commit/e36b0610291732e7fcfe1e9545b3f39fd7944897)) |
| - | refactor: ➖ remove emoji icon pkg | ([43c38ea](https://github.com/chenshunliang/dashboard/commit/43c38eacbc32df7b58d7f348809664b6ed7e60e6)) |
| - | perf: ⚡ close chart.js animation | ([e671359](https://github.com/chenshunliang/dashboard/commit/e67135914e57b45eaff6d8e89b67084cc5463e75)) |

# 1.22.0-rc.1 (2022-11-04)

### Bug Fixes

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | :bug: fix: 🐛 fix container list status is null bug | ([387f31f](https://github.com/chenshunliang/dashboard/commit/387f31ff915ccb20faa5d69e3c558d8484c8b26a)) |
| - | :bug: fix: 🐛 fix monitor dashboard global variable nil bug | ([b7e1ecb](https://github.com/chenshunliang/dashboard/commit/b7e1ecb5e47d370bb65bf3bedc149a0b51ed2a1e)) |

### Build

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | refactor: 👷 add pnpm to project and remove yarn | ([a92792c](https://github.com/chenshunliang/dashboard/commit/a92792c897d792837ee3ba38dff320450e8ac1c1)) |

# 1.22.0-rc.0 (2022-11-01)

### Bug Fixes

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | :bug: fix model deploy volume mount bugs, :zap: some optimizations | ([2342f74](https://github.com/chenshunliang/dashboard/commit/2342f74f5a93a58c30b46eb4eda5aa444c2ac663)) |
| - | :bug: fit requests.storage to limits.storage | ([a46f1c0](https://github.com/chenshunliang/dashboard/commit/a46f1c01148f47b2d4f6709cb61f4c5c8d0a5281)) |
| - | :bug: fix ace-editor import error bug, fix app config diff bugs | ([8e18a8e](https://github.com/chenshunliang/dashboard/commit/8e18a8eaea9c7b7c3bf53e32520cda058710cae4)) |
| - | :bug: fix add appmanifest yaml schema error bug | ([b51cd00](https://github.com/chenshunliang/dashboard/commit/b51cd0035219cd813fb023878acf69f4f3571896)) |

### Features

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | :sparkles: add alert channel for tenant , support model deploy upgrage strategy, fix few bugs | ([42346d6](https://github.com/chenshunliang/dashboard/commit/42346d63ed6ece9656b15737211d67a811ed2681)) |

### Build

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | 👷 add support vite to vue and remove webpack | ([42346d6](https://github.com/chenshunliang/dashboard/commit/59aa2524554d097bea3ae4ec0d0a9e9d86fa4be8)) |

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# 1.22.0-beta.2 (2022-10-12)

### 🌟 新功能

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | :sparkles: add pod list container state tip | [b95f29e](https://github.com/chenshunliang/dashboard/commit/b95f29e) |
| - | :sparkles: support feishu to alert receiver | [141ad0d](https://github.com/chenshunliang/dashboard/commit/141ad0d) |
| - | :sparkles: support mdx | [1c74d68](https://github.com/chenshunliang/dashboard/commit/1c74d68) |
| - | :sparkles: support upload and download file form container, :bug: fix monitor dashboard switch | [6961b03](https://github.com/chenshunliang/dashboard/ |

### 🏠 构建系统

| 范围 | 描述                               | commitId                                                             |
| ---- | ---------------------------------- | -------------------------------------------------------------------- |
| deps | bump async from 2.6.3 to 2.6.4     | [cb08cc3](https://github.com/chenshunliang/dashboard/commit/cb08cc3) |
| deps | bump moment from 2.29.1 to 2.29.2  | [6f886f3](https://github.com/chenshunliang/dashboard/commit/6f886f3) |
| deps | bump prismjs from 1.26.0 to 1.27.0 | [7dbc2ed](https://github.com/chenshunliang/dashboard/commit/7dbc2ed) |

### 🐛 Bug 修复

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | :bug: fix model deploy volume mount bugs, :zap: some optimizations | [2342f74](https://github.com/chenshunliang/dashboard/commit/2342f74) |
| - | :bug: fix add appmanifest yaml schema error bug | [b51cd00](https://github.com/chenshunliang/dashboard/commit/b51cd00) |
| - | :bug: fix add environment resourcequota no data bug | [ff9d254](https://github.com/chenshunliang/dashboard/commit/ff9d254) |
| - | :bug: fix add monitor rule unit unknown bug, fix metrics query expr not show chart bug | [e4ac627](https://github.com/chenshunliang/dashboard/commit/e4ac627) |
| - | :bug: fix alert history search filters | [383a2cd](https://github.com/chenshunliang/dashboard/commit/383a2cd) |
| - | :bug: fix app monitor router bug | [9d6c317](https://github.com/chenshunliang/dashboard/commit/9d6c317) |
| - | :bug: fix app-configer sidebar not show bug | [b606264](https://github.com/chenshunliang/dashboard/commit/b606264) |
| - | :bug: fix apply resource limit error bug | [051e3f3](https://github.com/chenshunliang/dashboard/commit/051e3f3) |
| - | :bug: fix appmanifest i18n bug | [3c2799c](https://github.com/chenshunliang/dashboard/commit/3c2799c) |
| - | :bug: fix appstore tag filter no data bug | [0f813b7](https://github.com/chenshunliang/dashboard/commit/0f813b7) |
| - | :bug: fix area chart % show | [09d2366](https://github.com/chenshunliang/dashboard/commit/09d2366) |
| - | :bug: fix cert-manager yaml commit error bug, fix log viewer time show error bug, :art: optimiz | [2110a88](https://github.com/chenshunliang/dashboard/commit/2110a88) |
| - | :bug: fix chart.js render time step bug | [bda3629](https://github.com/chenshunliang/dashboard/commit/bda3629) |
| - | :bug: fix ingress form not support tls bug, fix receiver list email bug, fix other bugs | [a192709](https://github.com/chenshunliang/dashboard/commit/a192709) |
| - | :bug: fix monitor dashboard global variable create bug | [09ef0b8](https://github.com/chenshunliang/dashboard/commit/09ef0b8) |
| - | :bug: fix monitor dashboard global variable error, fix list search page init error, fix resourc | [bf47994](https://github.com/chenshunliang/dashboard/commit/bf47994) |
| - | :bug: fix monitor dashboard global variable filter bug, :zap: optimization locales | [b59140b](https://github.com/chenshunliang/dashboard/commit/b59140b) |

### 🚀 性能优化

| 范围 | 描述 | commitId |
| --- | --- | --- |
| - | :zap: add chart.js to replace apexchart.js | [5cef540](https://github.com/chenshunliang/dashboard/commit/5cef540) |
| - | :zap: add custom chart.js legend click event, support broadcast link | [749337e](https://github.com/chenshunliang/dashboard/commit/749337e) |
| - | :zap: add feishu detail to log alert receiver list | [ca84c3a](https://github.com/chenshunliang/dashboard/commit/ca84c3a) |
| - | :zap: add model deploy auth flag to modelx | [4a0d0bd](https://github.com/chenshunliang/dashboard/commit/4a0d0bd) |
| - | :zap: add pod gpu monitor, optimization monitor dashboard variable not clear when env changed | [00ea90d](https://github.com/chenshunliang/dashboard/commit/00ea90d) |
| - | :zap: add radial bar chart | [5d29819](https://github.com/chenshunliang/dashboard/commit/5d29819) |
| - | :zap: add signSecret to receiver | [af94cc7](https://github.com/chenshunliang/dashboard/commit/af94cc7) |
| - | :zap: auto generate middleware name | [e1ad3e8](https://github.com/chenshunliang/dashboard/commit/e1ad3e8) |
