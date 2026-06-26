# Dependency Collector

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/shebaoting/dependency-collector.svg)](https://packagist.org/packages/shebaoting/dependency-collector) [![Total Downloads](https://img.shields.io/packagist/dt/shebaoting/dependency-collector.svg)](https://packagist.org/packages/shebaoting/dependency-collector)

Dependency Collector is a Flarum extension for building a curated, community-powered directory of products, libraries, tools, links, projects, or any other resources your forum wants to collect.

It was originally designed for collecting technical dependencies, but the extension is intentionally generic: users submit entries, moderators review them, categories keep the directory organized, and the forum frontend presents approved entries in a searchable card grid.

[Read the Chinese documentation](README.zh-CN.md)

![Dependency Collector demo](https://wyz-xyz.oss-cn-huhehaote.aliyuncs.com/2025-05-08/1746705066-417302-image.png)

Demo: [https://wyz.xyz/dependencies](https://wyz.xyz/dependencies)

## Requirements

- Flarum 2.x
- PHP 8.3 or higher
- Composer

## Features

- **Community submissions:** Signed-in users with permission can submit new directory items from the forum frontend.
- **Moderation workflow:** Submitted items can be reviewed, edited, approved, rejected, or deleted by users with moderation permission.
- **Custom categories:** The extension includes its own category system, separate from Flarum Tags. Each category can have a name, slug, description, color, and Font Awesome icon.
- **Category management UI:** Administrators can create and edit categories in the extension settings page. Icon codes can be typed manually or selected from the built-in icon picker.
- **Search:** The directory can be searched by title and description, with results updating directly in the frontend list.
- **Filtering:** Users can filter approved items by category.
- **Favorites:** Logged-in users can favorite and unfavorite items, and quickly switch to their saved list.
- **Responsive card layout:** Approved items are shown as cards with title, description, categories, author, and compact action buttons.
- **Bilingual language files:** English and Simplified Chinese translations are included.
- **Flarum 2 API resources:** The extension uses Flarum 2 resource-based API integration instead of the older Flarum 1 serializer/controller pattern.
- **Permission controls:** Admins can configure who may submit, moderate, delete, and manage categories.

## Common Use Cases

- A community product directory
- A library, package, or dependency collection
- A curated resource list
- A showcase of member projects
- A reading list or tool list
- A recommendation board that requires approval before publication

## Installation

Run this command in your Flarum root directory:

```sh
composer require shebaoting/dependency-collector:"*"
php flarum migrate
php flarum cache:clear
```

Then enable the extension in the Flarum admin dashboard.

## Updating

Run:

```sh
composer update shebaoting/dependency-collector:"*"
php flarum migrate
php flarum cache:clear
```

If you are upgrading from the Flarum 1.x version, keep your existing database data in place. The Flarum 2.x version is designed to continue using the extension's existing tables while updating the API and frontend integration.

## Usage

### 1. Enable the Extension

Go to the Flarum admin dashboard, open the extension list, and enable **Dependency Collector**.

### 2. Configure Permissions

Open the permissions page and configure the Dependency Collector permissions:

- Who can submit items
- Who can moderate submitted items
- Who can delete items
- Who can manage categories

Typical setup:

- Members can submit items.
- Moderators and administrators can review and moderate items.
- Administrators can manage categories.

### 3. Create Categories

Open the Dependency Collector settings page in the admin dashboard and create categories.

Each category supports:

- Name
- Slug
- Optional description
- Color
- Icon

The icon field accepts Font Awesome class names such as `fas fa-code`, `fas fa-cube`, or `fas fa-layer-group`. You can also pick an icon from the built-in selector, which fills the input for you.

### 4. Submit Items

Users with submit permission can open the forum directory page and click **Submit Dependency**.

Each item includes:

- Title
- Link
- Description
- One or more categories

New items are not shown publicly until approved.

### 5. Review Items

Moderators can review pending items from the admin page. They can approve, edit, reject, or delete entries.

### 6. Browse the Directory

Approved items are shown on the forum frontend. Users can:

- Browse all approved items
- Filter by category
- Search by title or description
- Favorite useful items
- Switch to their favorites list

## Frontend Route

The extension registers this forum route:

```text
/dependencies
```

For example:

```text
https://example.com/dependencies
```

## Development

Install frontend dependencies and build assets from the `js` directory:

```sh
cd js
corepack yarn install
corepack yarn build
```

During development you can use:

```sh
corepack yarn dev
```

After PHP or frontend changes, clear the Flarum cache from your Flarum root:

```sh
php flarum cache:clear
```

## Links

- My Community: [https://wyz.xyz](https://wyz.xyz)
- Packagist: [https://packagist.org/packages/shebaoting/dependency-collector](https://packagist.org/packages/shebaoting/dependency-collector)
- GitHub: [https://github.com/shebaoting/dependency-collector](https://github.com/shebaoting/dependency-collector)

## Contact

For custom Flarum extension development or collaboration:

Email: th9th@th9th.com

## License

This extension is open-sourced software licensed under the [MIT license](LICENSE).
