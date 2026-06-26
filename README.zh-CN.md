# Dependency Collector 中文说明

Dependency Collector 是一个适用于 Flarum 2.x 的资源收集与展示扩展。它可以让论坛用户提交产品、工具、依赖库、项目、链接、教程或其他资源，管理员审核后在前台以卡片列表的形式展示。

这个扩展最初是为了收集技术依赖和开发工具而设计的，但它的实际用途更通用：只要你的社区需要一个“用户提交、管理员审核、分类展示、支持搜索和收藏”的资源目录，就可以使用它。

[Back to English README](README.md)

## 运行要求

- Flarum 2.x
- PHP 8.3 或更高版本
- Composer

## 功能介绍

- **用户提交资源：** 有权限的登录用户可以在前台提交新的资源条目。
- **管理员审核：** 用户提交后不会立即公开，需要管理员或有审核权限的用户审核通过。
- **独立分类系统：** 扩展自带分类功能，不依赖 Flarum 官方 Tags 扩展。每个分类可以设置名称、标识符、描述、颜色和图标。
- **分类管理界面：** 后台可以创建、编辑和删除分类。图标字段保留输入框，也支持通过选择器快速填充 Font Awesome 图标代码。
- **前台搜索：** 用户可以按标题和介绍进行模糊搜索，输入后列表会及时显示匹配结果。
- **分类筛选：** 前台可以按分类筛选资源。
- **收藏功能：** 登录用户可以收藏或取消收藏资源，也可以切换到“我的收藏”列表。
- **卡片式布局：** 已审核的资源会以卡片形式展示，包括标题、简介、分类、作者和操作按钮。
- **中英文语言包：** 内置英文和简体中文语言文件。
- **适配 Flarum 2：** 使用 Flarum 2 的 API Resource 机制，替代旧版 Flarum 1.x 的 Controller / Serializer 写法。
- **权限控制：** 可分别控制谁能提交、谁能审核、谁能删除、谁能管理分类。

## 适用场景

- 产品导航或产品推荐列表
- Laravel / Flarum / 前端资源收集
- 开源项目展示
- 社区成员作品展示
- 优质文章、教程、工具链接收集
- 需要审核流程的资源投稿系统

## 安装

在 Flarum 根目录执行：

```sh
composer require shebaoting/dependency-collector:"*"
php flarum migrate
php flarum cache:clear
```

然后进入 Flarum 后台，在扩展列表中启用 **Dependency Collector**。

## 更新

在 Flarum 根目录执行：

```sh
composer update shebaoting/dependency-collector:"*"
php flarum migrate
php flarum cache:clear
```

如果你是从 Flarum 1.x 版本升级到 Flarum 2.x 版本，原有数据库数据可以保留。新版会继续使用扩展已有的数据表，并更新 API 和前端集成方式。

## 使用方式

### 1. 启用扩展

进入 Flarum 后台扩展列表，启用 **Dependency Collector**。

### 2. 设置权限

进入后台权限页面，配置与 Dependency Collector 相关的权限：

- 谁可以提交资源
- 谁可以审核资源
- 谁可以删除资源
- 谁可以管理分类

常见配置方式：

- 普通注册用户可以提交资源。
- 管理员和版主可以审核、编辑、删除资源。
- 只有管理员可以管理分类。

### 3. 创建分类

进入 Dependency Collector 的后台设置页面，创建资源分类。

每个分类支持：

- 名称
- 标识符，也就是 slug
- 描述，可选
- 颜色
- 图标

图标使用 Font Awesome class，例如：

```text
fas fa-code
fas fa-cube
fas fa-layer-group
```

你可以直接输入图标代码，也可以通过内置图标选择器选择，选择后会自动填充到输入框。

### 4. 用户提交资源

有提交权限的用户可以进入前台资源页，点击 **提交产品** 或对应语言包中的提交按钮。

资源条目通常包含：

- 标题
- 链接
- 简介
- 一个或多个分类

提交后的资源会进入待审核状态。

### 5. 审核资源

有审核权限的用户可以在后台管理页查看待审核资源，并进行：

- 审核通过
- 编辑
- 拒绝
- 删除

审核通过后，资源会显示在前台列表中。

### 6. 前台浏览

前台资源页支持：

- 查看全部已审核资源
- 按分类筛选
- 按标题和简介搜索
- 收藏资源
- 查看我的收藏

## 前台访问地址

扩展默认注册的前台路由是：

```text
/dependencies
```

例如：

```text
https://example.com/dependencies
```

## 开发说明

前端代码在 `js` 目录下。安装依赖并构建：

```sh
cd js
corepack yarn install
corepack yarn build
```

开发时可以使用：

```sh
corepack yarn dev
```

修改 PHP 或前端资源后，建议在 Flarum 根目录清理缓存：

```sh
php flarum cache:clear
```

## 相关链接

- 我的社区：[https://wyz.xyz](https://wyz.xyz)
- Packagist：[https://packagist.org/packages/shebaoting/dependency-collector](https://packagist.org/packages/shebaoting/dependency-collector)
- GitHub：[https://github.com/shebaoting/dependency-collector](https://github.com/shebaoting/dependency-collector)

## 联系方式

如果你需要定制 Flarum 扩展或其他协作，可以通过下面的邮箱联系：

Email: th9th@th9th.com

## 开源协议

本扩展基于 [MIT license](LICENSE) 开源。
