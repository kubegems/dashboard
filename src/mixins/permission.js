import { mapGetters, mapState } from 'vuex'

const permission = {
  data() {
    return {
      projectRoleCN: {
        dev: '研发',
        test: '测试',
        ops: '运维',
        admin: '管理员',
        sys: '系统管理员',
        tenantadmin: '租户管理员',
      },
      resourceRoleCN: {
        operator: '操作成员',
        reader: '只读成员',
        sys: '系统管理员',
        tenantadmin: '租户管理员',
        projectadmin: '项目管理员',
        projectops: '项目运维',
      },
      tenantRoleCN: {
        ordinary: '普通成员',
        admin: '管理员',
        sys: '系统管理员',
      },
      virtualSpaceRoleCN: {
        normal: '普通成员',
        admin: '管理员',
        sys: '系统管理员',
      },
    }
  },
  computed: {
    ...mapState(['Auth', 'Admin']),
    ...mapGetters(['VirtualSpace', 'Tenant', 'Project', 'Environment']),
    resourceAllow() {
      return (
        this.Auth.environments.findIndex((t) => {
          return t.id === this.Environment().ID && t.isAdmin
        }) > -1 ||
        this.Admin ||
        this.projectAllow ||
        this.tenantAllow
      )
    },
    projectAllow() {
      return (
        this.Auth.projects.findIndex((t) => {
          return t.id === this.Project().ID && (t.isAdmin || t.role === 'ops')
        }) > -1 ||
        this.Admin ||
        this.tenantAllow
      )
    },
    tenantAllow() {
      return (
        this.Auth.tenant.findIndex((t) => {
          return t.id === this.Tenant().ID && t.isAdmin
        }) > -1 || this.Admin
      )
    },
    virtualSpaceAllow() {
      return (
        this.Auth.virtualSpaces.findIndex((t) => {
          return t.isAdmin && t.id === this.VirtualSpace().ID
        }) > -1 || this.Admin
      )
    },
    resourceRole() {
      if (this.Admin) return 'sys'
      if (this.tenantRole === 'admin') return 'tenantadmin'
      if (this.projectRole === 'admin') return 'projectadmin'
      if (this.projectRole === 'ops') return 'projectops'
      const role = this.Auth.environments.find((t) => {
        return t.id === this.Environment().ID
      })
      if (role) {
        return role.role
      }
      return 'reader'
    },
    projectRole() {
      if (this.Admin) return 'sys'
      if (this.tenantRole === 'admin') return 'tenantadmin'
      const role = this.Auth.projects.find((t) => {
        return t.id === this.Project().ID
      })
      if (role) {
        return role.role
      }
      return ''
    },
    tenantRole() {
      if (this.Admin) return 'sys'
      const role = this.Auth.tenant.find((t) => {
        return t.id === this.Tenant().ID
      })
      if (role) {
        return role.role
      }
      return 'ordinary'
    },
    virtualSpaceRole() {
      if (this.Admin) return 'sys'
      const role = this.Auth.virtualSpaces.find((t) => {
        return t.id === this.VirtualSpace().ID
      })
      if (role) {
        return role.role
      }
      return 'normal'
    },
  },
}

export default permission
