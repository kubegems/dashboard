import transferDom from './transfer_dom'

const directives = {}

directives.install = function (Vue) {
  Vue.directive('transfer-dom', transferDom)
}

export default directives
