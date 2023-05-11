import { typeOf } from '@kubegems/libs/utils/helpers';

import { useGlobalI18n } from './i18n';

const i18n = useGlobalI18n();

export const required = (v: any): boolean | string => {
  const type: string = typeOf(v);
  let pass = false;
  switch (type) {
    case 'object':
      pass = !!Object.keys(v).length;
      break;
    case 'array':
      pass = !!v.length;
      break;
    case 'number':
      pass = true;
      break;
    default:
      pass = !!v && v.trim().length > 0;
  }
  return pass || i18n.t('ruler.required').toString();
};

export const positiveInteger = (v: string): boolean | string =>
  !v || !!new RegExp('^[1-9]\\d*|0$').test(v) || i18n.t('ruler.positive_integer').toString();

export const integer = (v: string): boolean | string =>
  !v || !!new RegExp('^\\d+$').test(v) || i18n.t('ruler.integer').toString();

export const timeInterval = (v: string): boolean | string =>
  !v || !!new RegExp('(^\\d+[s|m|h]$)').test(v) || i18n.t('ruler.time_interval').toString();

export const sizeGB = (v: string): boolean | string =>
  !v || !!new RegExp('(^\\d+[G]$)').test(v) || i18n.t('ruler.size_gb').toString();

export const port = (v: string): boolean | string =>
  (!!new RegExp('^[1-9]\\d*|0$').test(v) && Number(v) <= 65533) || i18n.t('ruler.port').toString();

export const k8sLabel = (v: string): boolean | string =>
  !!new RegExp('^(?!-)([-A-Za-z0-9]){0,63}(?<!-)$').test(v) || i18n.t('ruler.k8s_label').toString();

export const k8sAnnotation = (v: string): boolean | string =>
  !!new RegExp('^(?!-)([-A-Za-z0-9]){0,253}(?<!-)$').test(v) || i18n.t('ruler.k8s_annotation').toString();

export const k8sName = (v: string): boolean | string =>
  !!new RegExp('^(?!-)([-a-z0-9]){0,253}(?<!-)$').test(v) || i18n.t('ruler.k8s_name').toString();

export const email = (v: string): boolean | string =>
  !!new RegExp('^[\\.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$').test(v) || i18n.t('ruler.email').toString();

export const phone = (v: string): boolean | string =>
  !!new RegExp('^1(3\\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\\d|9[0-35-9])\\d{8}$').test(v) ||
  i18n.t('ruler.mobile').toString();

export const password = (v: string): boolean | string =>
  !!new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!\\.@#$%~])[A-Za-z\\d!\\.@#$%~]{8,32}', 'g').test(v) ||
  i18n.t('ruler.password').toString();
