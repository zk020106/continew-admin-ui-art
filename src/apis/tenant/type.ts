/** 租户 */
export interface TenantResp {
  id: string
  name: string
  code: string
  domain: string
  expireTime: string
  description: string
  status: 1 | 2
  packageId: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  adminUsername: string
  packageName: string
  disabled: boolean
}
export interface TenantQuery {
  description?: string
  packageId?: string
  status?: string
  sort: Array<string>
}
export interface TenantPageQuery extends TenantQuery, PageQuery {}

/** 租户套餐 */
export interface TenantPackageResp {
  id: string
  name: string
  sort: number
  menuCheckStrictly: string
  description: string
  status: 1 | 2
  menuIds: []
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface TenantPackageQuery {
  description?: string
  status?: string
  sort: Array<string>
}
export interface TenantPackagePageQuery extends TenantPackageQuery, PageQuery {}

/** 租户新增/修改请求 */
export interface TenantReq {
  name: string
  code?: string
  domain?: string
  expireTime?: string
  description?: string
  status?: string
  packageId: string
  adminUsername?: string
  adminPassword?: string
}

/** 租户套餐新增/修改请求 */
export interface TenantPackageReq {
  name: string
  sort?: number
  menuCheckStrictly?: boolean
  description?: string
  status?: string
  menuIds?: Array<string>
}

/** 租户管理员密码修改请求 */
export interface TenantAdminPwdReq {
  password: string
  confirmPassword: string
}

/** 租户套餐菜单响应类型 */
export interface TenantPackageMenuResp {
  id: string
  title: string
  parentId: string
  children?: TenantPackageMenuResp[]
}
