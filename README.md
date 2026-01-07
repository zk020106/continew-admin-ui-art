# Continew Admin UI Art

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/zk020106/continew-admin-ui-art?utm_source=oss&utm_medium=github&utm_campaign=zk020106%2Fcontinew-admin-ui-art&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews) 基于 Vue 3 + Element Plus + TypeScript 的企业级后台管理系统。

## 特性

- **Vue 3** - 组合式 API + TypeScript
- **Element Plus** - Vue 3 组件库
- **Vite 5** - 极速构建
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Tailwind CSS 4** - 原子化 CSS
- **ESLint + Prettier** - 代码规范
- **Husky + lint-staged** - Git Hooks

## 功能模块

| 模块     | 说明                         |
| -------- | ---------------------------- |
| 工作台   | Dashboard 数据展示           |
| 系统管理 | 用户、角色、菜单、部门、字典 |
| 租户管理 | 租户、租户套餐               |
| 基础设施 | 文件管理、定时任务、日志监控 |
| 短信管理 | 短信模板、短信日志           |

## 快速开始

### 环境要求

- Node.js >= 20.19.0
- pnpm >= 8.8.0

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产

```bash
pnpm build
```

### 类型检查

```bash
pnpm type-check
```

### 代码规范

```bash
# 检查并修复
pnpm lint
pnpm fix

# 仅 Prettier 格式化
pnpm lint:prettier

# 仅 Stylelint 格式化
pnpm lint:stylelint
```

### 提交规范

```bash
pnpm commit
```

## 项目结构

```
src/
├── apis/                 # API 接口定义
├── assets/               # 静态资源
├── components/           # 公共组件
│   └── base/            # 基础组件 (CaButton, CaForm, CaTable, CaDetail)
├── constant/             # 常量定义
├── hooks/                # 组合式函数
│   ├── business/        # 业务 hooks
│   └── core/           # 核心 hooks
├── locales/             # 国际化
├── router/              # 路由配置
├── store/               # Pinia 状态管理
├── styles/              # 样式文件
├── types/               # TypeScript 类型
├── utils/               # 工具函数
└── views/               # 页面视图
```

## 组件库

项目封装了一套基础组件，统一前缀 `Ca`：

| 组件           | 说明       |
| -------------- | ---------- |
| `CaButton`     | 按钮       |
| `CaForm`       | 表单       |
| `CaTable`      | 表格       |
| `CaDetail`     | 详情       |
| `CaCellStatus` | 状态单元格 |
| `CaCellTags`   | 标签单元格 |
| `CaCellCopy`   | 复制单元格 |
| `CaAvatar`     | 头像       |
| `CaPageLayout` | 页面布局   |

## Git Hooks

- `commit-msg`: 校验提交信息格式
- `pre-commit`: ESLint + Prettier 检查
- `pre-push`: 类型检查

## 依赖技术

| 技术         | 版本    | 用途        |
| ------------ | ------- | ----------- |
| vue          | ^3.5.21 | 框架        |
| element-plus | ^2.11.2 | UI 组件库   |
| pinia        | ^3.0.3  | 状态管理    |
| vue-router   | ^4.5.1  | 路由        |
| axios        | ^1.12.2 | HTTP 客户端 |
| vue-i18n     | ^9.14.0 | 国际化      |
| @vueuse/core | ^13.9.0 | 工具函数    |
| tailwindcss  | ^4.1.14 | CSS 框架    |
| echarts      | ^6.0.0  | 图表        |

## License

MIT
