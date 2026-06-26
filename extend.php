<?php

/*
 * This file is part of shebaoting/dependency-collector.
 *
 *
 * Copyright (c) 2025 Shebaoting.
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Shebaoting\DependencyCollector;

use Flarum\Api\Context;
use Flarum\Api\Resource;
use Flarum\Api\Schema;
use Flarum\Extend;
use Flarum\Frontend\Document;
use Shebaoting\DependencyCollector\Api\Resource\DependencyItemResource;
use Shebaoting\DependencyCollector\Api\Resource\DependencyTagResource;
use Shebaoting\DependencyCollector\Models\DependencyItem;
use Shebaoting\DependencyCollector\Access\DependencyItemPolicy;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less')
        ->route('/dependencies', 'dependency-collector.forum.index', function (Document $document) {
            $document->title = 'Dependency Collector';
        }),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),

    (new Extend\Locales(__DIR__ . '/locale')),

    new Extend\ApiResource(DependencyItemResource::class),
    new Extend\ApiResource(DependencyTagResource::class),

    (new Extend\Policy())
        ->modelPolicy(DependencyItem::class, DependencyItemPolicy::class),

    (new Extend\ApiResource(Resource\ForumResource::class))
        ->fields(fn () => [
            Schema\Boolean::make('canSubmitDependencyCollectorItem')
                ->get(fn ($forum, Context $context) => $context->getActor()->hasPermission('dependency-collector.submit')),
            Schema\Boolean::make('canDeleteDependencyCollectorItem')
                ->get(fn ($forum, Context $context) => $context->getActor()->hasPermission('dependency-collector.moderate')),
            Schema\Boolean::make('canFavoriteDependencyCollectorItemGlobal')
                ->get(fn ($forum, Context $context) => ! $context->getActor()->isGuest()),
        ]),
];
