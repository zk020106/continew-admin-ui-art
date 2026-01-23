/**
 * 路由转换器
 *
 * 负责将菜单数据转换为 Vue Router 路由配置
 *
 * @module router/core/RouteTransformer
 * @author Art Design Pro Team
 */

import type { RouteRecordRaw } from 'vue-router'
import type { ComponentLoader } from './ComponentLoader'
import type { AppRouteRecord } from '@/types/router'
import { IframeRouteManager } from './IframeRouteManager'

interface ConvertedRoute extends Omit<RouteRecordRaw, 'children'> {
  id?: string | number
  children?: ConvertedRoute[]
  component?: RouteRecordRaw['component'] | (() => Promise<any>)
}

export class RouteTransformer {
  private componentLoader: ComponentLoader
  private iframeManager: IframeRouteManager

  constructor(componentLoader: ComponentLoader) {
    this.componentLoader = componentLoader
    this.iframeManager = IframeRouteManager.getInstance()
  }

  /**
   * 转换路由配置
   */
  transform(route: AppRouteRecord, depth = 0): ConvertedRoute {
    const { component, children, ...routeConfig } = route

    // 基础路由配置
    const converted: ConvertedRoute = {
      ...routeConfig,
      component: undefined
    }

    // 处理不同类型的路由
    if (route.meta.isIframe) {
      this.handleIframeRoute(converted, route, depth)
    } else if (this.isFirstLevelRoute(route, depth)) {
      this.handleFirstLevelRoute(converted, route, component as string)
    } else {
      this.handleNormalRoute(converted, component as string)
    }

    // 递归处理子路由，过滤掉使用相同 path 但仅通过 query 参数区分的子菜单
    // 这种子菜单仅用于菜单显示，实际由父组件内部处理 tab 切换
    if (children?.length) {
      const validChildren = this.filterValidChildren(children, route.path || '')
      if (validChildren.length > 0) {
        converted.children = validChildren.map((child) => this.transform(child, depth + 1))
      }
    }

    return converted
  }

  /**
   * 过滤有效的子路由
   * 如果子路由的 path（不含 query 和 hash）与父路由相同，则不将其作为嵌套路由注册
   */
  private filterValidChildren(children: AppRouteRecord[], parentPath: string): AppRouteRecord[] {
    return children.filter((child) => {
      const childPath = child.path || ''
      // 移除 query 参数和 hash
      const basePath = childPath.split('?')[0].split('#')[0]
      // 只有子路由 path（不含 query）与父路由不同时，才作为嵌套路由
      return basePath !== parentPath
    })
  }

  /**
   * 判断是否为一级路由（需要 Layout 包裹）
   */
  private isFirstLevelRoute(route: AppRouteRecord, depth: number): boolean {
    return depth === 0 && (!route.children || route.children.length === 0)
  }

  /**
   * 处理 iframe 类型路由
   */
  private handleIframeRoute(
    targetRoute: ConvertedRoute,
    sourceRoute: AppRouteRecord,
    depth: number
  ): void {
    if (depth === 0) {
      // 顶级 iframe：用 Layout 包裹
      targetRoute.component = this.componentLoader.loadLayout()
      targetRoute.path = this.extractFirstSegment(sourceRoute.path || '')
      targetRoute.name = ''

      targetRoute.children = [
        {
          ...sourceRoute,
          component: this.componentLoader.loadIframe()
        } as ConvertedRoute
      ]
    } else {
      // 非顶级（嵌套）iframe：直接使用 Iframe.vue
      targetRoute.component = this.componentLoader.loadIframe()
    }

    // 记录 iframe 路由
    this.iframeManager.add(sourceRoute)
  }

  /**
   * 处理一级菜单路由
   */
  private handleFirstLevelRoute(
    converted: ConvertedRoute,
    route: AppRouteRecord,
    component: string | (() => Promise<any>) | undefined
  ): void {
    converted.component = this.componentLoader.loadLayout()
    converted.path = this.extractFirstSegment(route.path || '')
    converted.name = ''
    route.meta.isFirstLevel = true

    // 处理 component：如果是函数形式直接使用，否则通过 loader 加载
    const resolvedComponent
      = typeof component === 'function'
        ? component
        : component
          ? this.componentLoader.load(component)
          : undefined

    converted.children = [
      {
        ...route,
        component: resolvedComponent
      } as ConvertedRoute
    ]
  }

  /**
   * 处理普通路由
   */
  private handleNormalRoute(
    converted: ConvertedRoute,
    component: string | (() => Promise<any>) | undefined
  ): void {
    if (component) {
      // 如果 component 是函数形式（懒加载组件），直接使用
      if (typeof component === 'function') {
        converted.component = component
      } else {
        converted.component = this.componentLoader.load(component)
      }
    }
  }

  /**
   * 提取路径的第一段
   */
  private extractFirstSegment(path: string): string {
    const segments = path.split('/').filter(Boolean)
    return segments.length > 0 ? `/${segments[0]}` : '/'
  }
}
