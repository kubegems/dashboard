import { typeOf } from './helpers'

export const required = v => {
  const type = typeOf(v)
  let pass = false
  switch (type) {
    case 'object': pass = !!Object.keys(v).length; break
    case 'array': pass = !!v.length; break
    case 'number': pass = true; break
    default: pass = !!v && v.trim().length > 0
  }
  return pass || '必填项'
}

export const positiveInteger = v => !v || !!new RegExp('^[1-9]\\d*|0$').test(v) || '格式错误(示例:正整数)'

export const integer = v => !v || !!new RegExp('^\\d+$').test(v) || '格式错误(示例:整数)'

export const timeInterval = v => !v || !!new RegExp('(^\\d+[s|m|h]$)').test(v) || '格式错误(示例:30s,1m,1h)'

export const sizeGB = v => !v || !!new RegExp('(^\\d+[G]$)').test(v) || '格式错误(示例:10G)'

export const port = v => !!new RegExp('^[1-9]\\d*|0$').test(v) && Number(v) <= 65533 || '格式错误(示例:9200)'

export const k8sLabel = (v) => !!new RegExp('^([A-Za-z0-9][-A-Za-z0-9_./]*)?[A-Za-z0-9]{0,63}$').test(v) || '不符合Kubernetes标签规范'

export const k8sAnnotation = (v) => !!new RegExp('([A-Za-z0-9][-A-Za-z0-9_./]*)?[A-Za-z0-9]').test(v) || '不符合Kubernetes注解规范'

export const k8sName = (v) => !!new RegExp('^([a-z0-9]([-a-z0-9./]*[a-z0-9])?){0,253}$').test(v) || '不符合Kubernetes命名规范'

export const email = (v) => !!new RegExp('^[\\.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$').test(v) || '邮箱格式错误'

export const phone = (v) => !!new RegExp('^1(3\\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\\d|9[0-35-9])\\d{8}$').test(v) || '手机号格式错误'

export const password = (v) => !!new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!\\.@#$%~])[A-Za-z\\d!\\.@#$%~]{8,16}', 'g').test(v) || '格式错误(包含大小写数字特殊字符8到16位密码)'
