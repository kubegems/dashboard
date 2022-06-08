import Vue from 'vue'

export const menuFilter = (item) => {
    var paths = item.children || []
    if (Vue.prototype.$pathFilters && Vue.prototype.$pathFilters.length > 0) {
        Vue.prototype.$pathFilters.forEach(fn => {
            paths = fn(paths)
        });
    }
    return paths
}
