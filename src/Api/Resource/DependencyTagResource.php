<?php

namespace Shebaoting\DependencyCollector\Api\Resource;

use Flarum\Api\Context as FlarumContext;
use Flarum\Api\Endpoint;
use Flarum\Api\Resource\AbstractDatabaseResource;
use Flarum\Api\Schema;
use Flarum\Api\Sort\SortColumn;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str as LaravelStr;
use Shebaoting\DependencyCollector\Models\DependencyTag;
use Tobyz\JsonApiServer\Context;

/**
 * @extends AbstractDatabaseResource<DependencyTag>
 */
class DependencyTagResource extends AbstractDatabaseResource
{
    public function type(): string
    {
        return 'dependency-tags';
    }

    public function model(): string
    {
        return DependencyTag::class;
    }

    public function scope(Builder $query, Context $context): void
    {
        $query->withCount('items')->orderBy('name');
    }

    public function endpoints(): array
    {
        return [
            Endpoint\Index::make()
                ->paginate(50, 100),
            Endpoint\Show::make(),
            Endpoint\Create::make()
                ->authenticated()
                ->can('dependency-collector.manageTags'),
            Endpoint\Update::make()
                ->authenticated()
                ->can('dependency-collector.manageTags'),
            Endpoint\Delete::make()
                ->authenticated()
                ->can('dependency-collector.manageTags'),
        ];
    }

    public function fields(): array
    {
        return [
            Schema\Str::make('name')
                ->requiredOnCreate()
                ->maxLength(100)
                ->unique((new DependencyTag())->getTable(), 'name', true)
                ->writable(fn (DependencyTag $tag, FlarumContext $context) => $this->canManageTags($context)),
            Schema\Str::make('slug')
                ->nullable()
                ->deserialize(fn (mixed $value) => $value === '' ? null : $value)
                ->maxLength(100)
                ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')
                ->unique((new DependencyTag())->getTable(), 'slug', true)
                ->writable(fn (DependencyTag $tag, FlarumContext $context) => $this->canManageTags($context)),
            Schema\Str::make('description')
                ->nullable()
                ->maxLength(255)
                ->writable(fn (DependencyTag $tag, FlarumContext $context) => $this->canManageTags($context)),
            Schema\Str::make('color')
                ->nullable()
                ->deserialize(fn (mixed $value) => $value === '' ? null : $value)
                ->maxLength(7)
                ->regex('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/')
                ->writable(fn (DependencyTag $tag, FlarumContext $context) => $this->canManageTags($context)),
            Schema\Str::make('icon')
                ->nullable()
                ->deserialize(fn (mixed $value) => $value === '' ? null : $value)
                ->maxLength(100)
                ->writable(fn (DependencyTag $tag, FlarumContext $context) => $this->canManageTags($context)),
            Schema\DateTime::make('createdAt')
                ->property('created_at'),
            Schema\DateTime::make('updatedAt')
                ->property('updated_at'),
            Schema\Number::make('itemCount')
                ->get(fn (DependencyTag $tag) => (int) ($tag->items_count ?? $tag->items()->count())),
            Schema\Boolean::make('canEdit')
                ->get(fn (DependencyTag $tag, FlarumContext $context) => $this->canManageTags($context)),
        ];
    }

    public function sorts(): array
    {
        return [
            SortColumn::make('name'),
            SortColumn::make('createdAt')->column('created_at'),
            SortColumn::make('itemCount')->column('items_count'),
        ];
    }

    public function creating(object $model, Context $context): ?object
    {
        /** @var DependencyTag $model */
        $this->normalizeTag($model);

        return $model;
    }

    public function updating(object $model, Context $context): ?object
    {
        /** @var DependencyTag $model */
        $this->normalizeTag($model);

        return $model;
    }

    public function deleting(object $model, Context $context): void
    {
        /** @var DependencyTag $model */
        $model->items()->detach();
    }

    private function normalizeTag(DependencyTag $tag): void
    {
        if (! $tag->slug && $tag->name) {
            $tag->slug = LaravelStr::slug($tag->name);
        }

        if (! $tag->icon) {
            $tag->icon = 'fas fa-code';
        }
    }

    private function canManageTags(FlarumContext $context): bool
    {
        return $context->getActor()->hasPermission('dependency-collector.manageTags');
    }
}
