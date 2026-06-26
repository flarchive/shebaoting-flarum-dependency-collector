<?php

namespace Shebaoting\DependencyCollector\Api\Resource;

use Carbon\Carbon;
use Flarum\Api\Context as FlarumContext;
use Flarum\Api\Endpoint;
use Flarum\Api\Resource\AbstractDatabaseResource;
use Flarum\Api\Schema;
use Flarum\Api\Sort\SortColumn;
use Illuminate\Database\Eloquent\Builder;
use Shebaoting\DependencyCollector\Models\DependencyItem;
use Tobyz\JsonApiServer\Context;

/**
 * @extends AbstractDatabaseResource<DependencyItem>
 */
class DependencyItemResource extends AbstractDatabaseResource
{
    public function type(): string
    {
        return 'dependency-items';
    }

    public function model(): string
    {
        return DependencyItem::class;
    }

    public function endpoints(): array
    {
        $defaultInclude = ['user', 'tags', 'approver', 'favoritedByUsers'];

        return [
            Endpoint\Index::make()
                ->paginate(20, 50)
                ->query(fn (
                    Builder $query,
                    $pagination,
                    FlarumContext $context,
                    array $filters,
                    ?array $sort,
                    int $offset,
                    ?int $limit
                ) => $this->applyIndexQuery($query, $pagination, $context, $filters, $sort)),
            Endpoint\Show::make()
                ->defaultInclude($defaultInclude),
            Endpoint\Create::make()
                ->authenticated()
                ->can('dependency-collector.submit')
                ->defaultInclude($defaultInclude),
            Endpoint\Update::make()
                ->authenticated()
                ->visible(fn (DependencyItem $item, FlarumContext $context) => $context->getActor()->can('edit', $item))
                ->defaultInclude($defaultInclude),
            Endpoint\Delete::make()
                ->authenticated()
                ->can('delete'),
            Endpoint\Endpoint::make('favorite')
                ->route('POST', '/{id}/favorite')
                ->authenticated()
                ->can('favoriteItem')
                ->defaultInclude($defaultInclude)
                ->action(function (FlarumContext $context): DependencyItem {
                    /** @var DependencyItem $item */
                    $item = $context->model;

                    $item->favoritedByUsers()->toggle($context->getActor()->id);
                    $item->load($defaultInclude);

                    return $item;
                }),
        ];
    }

    public function fields(): array
    {
        return [
            Schema\Str::make('title')
                ->requiredOnCreate()
                ->maxLength(255)
                ->writable(fn (DependencyItem $item, FlarumContext $context) => $this->canWriteItem($item, $context)),
            Schema\Str::make('link')
                ->requiredOnCreate()
                ->rule('url')
                ->maxLength(255)
                ->writable(fn (DependencyItem $item, FlarumContext $context) => $this->canWriteItem($item, $context)),
            Schema\Str::make('description')
                ->requiredOnCreate()
                ->maxLength(5000)
                ->writable(fn (DependencyItem $item, FlarumContext $context) => $this->canWriteItem($item, $context)),
            Schema\Str::make('status')
                ->default('pending')
                ->in(['pending', 'approved', 'rejected'])
                ->writable(fn (DependencyItem $item, FlarumContext $context) => $context->updating() && $context->getActor()->can('approve', $item)),
            Schema\DateTime::make('submittedAt')
                ->property('submitted_at'),
            Schema\DateTime::make('approvedAt')
                ->property('approved_at')
                ->nullable(),
            Schema\Boolean::make('canEdit')
                ->get(fn (DependencyItem $item, FlarumContext $context) => $context->getActor()->can('edit', $item)),
            Schema\Boolean::make('canApprove')
                ->get(fn (DependencyItem $item, FlarumContext $context) => $context->getActor()->can('approve', $item)),
            Schema\Boolean::make('canDelete')
                ->get(fn (DependencyItem $item, FlarumContext $context) => $context->getActor()->can('delete', $item)),
            Schema\Boolean::make('isFavorited')
                ->get(fn (DependencyItem $item, FlarumContext $context) => $this->isFavorited($item, $context)),
            Schema\Boolean::make('canFavorite')
                ->get(fn (DependencyItem $item, FlarumContext $context) => $context->getActor()->can('favoriteItem', $item)),
            Schema\Relationship\ToOne::make('user')
                ->type('users')
                ->includable(),
            Schema\Relationship\ToOne::make('approver')
                ->type('users')
                ->includable(),
            Schema\Relationship\ToMany::make('tags')
                ->type('dependency-tags')
                ->includable()
                ->requiredOnCreate()
                ->validate(function (array $tags, callable $fail, FlarumContext $context) {
                    if ($context->creating() && count($tags) < 1) {
                        $fail('At least one plugin tag is required.');
                    }
                })
                ->writable(fn (DependencyItem $item, FlarumContext $context) => $this->canWriteItem($item, $context)),
            Schema\Relationship\ToMany::make('favoritedByUsers')
                ->type('users')
                ->includable(),
        ];
    }

    public function sorts(): array
    {
        return [
            SortColumn::make('submittedAt')->column('submitted_at'),
            SortColumn::make('approvedAt')->column('approved_at'),
            SortColumn::make('status'),
        ];
    }

    public function creating(object $model, Context $context): ?object
    {
        /** @var DependencyItem $model */
        $model->user_id = $context->getActor()->id;
        $model->status ??= 'pending';
        $model->submitted_at ??= Carbon::now();

        return $model;
    }

    public function updating(object $model, Context $context): ?object
    {
        /** @var DependencyItem $model */
        if ($model->isDirty('status')) {
            if ($model->status === 'approved') {
                $model->approved_at = Carbon::now();
                $model->approver_user_id = $context->getActor()->id;
            } else {
                $model->approved_at = null;
                $model->approver_user_id = null;
            }
        }

        return $model;
    }

    public function deleting(object $model, Context $context): void
    {
        /** @var DependencyItem $model */
        $model->tags()->detach();
        $model->favoritedByUsers()->detach();
    }

    protected function applyIndexQuery(Builder $query, mixed $pagination, FlarumContext $context, array $filters, ?array $sort): FlarumContext
    {
        $actor = $context->getActor();

        $query->with(['user', 'tags', 'approver', 'favoritedByUsers']);

        $isMyFavorites = (bool) ($filters['isFavorite'] ?? false);
        if ($isMyFavorites) {
            $actor->assertRegistered();

            $query->whereHas('favoritedByUsers', fn (Builder $query) => $query->where('users.id', $actor->id));
        }

        if (! $isMyFavorites) {
            if (! $actor->hasPermission('dependency-collector.moderate')) {
                $query->where(function (Builder $query) use ($actor) {
                    $query->where('status', 'approved');

                    if (! $actor->isGuest()) {
                        $query->orWhere(function (Builder $query) use ($actor) {
                            $query->where('user_id', $actor->id)
                                ->where('status', 'pending');
                        });
                    }
                });
            } elseif (($filters['status'] ?? null) && in_array($filters['status'], ['pending', 'approved', 'rejected'], true)) {
                $query->where('status', $filters['status']);
            }
        }

        if ($tagFilterSlug = $filters['tag'] ?? null) {
            $query->whereHas('tags', fn (Builder $query) => $query->where('dependency_collector_tags.slug', $tagFilterSlug));
        }

        $search = trim((string) ($filters['q'] ?? ''));
        if ($search !== '') {
            $like = '%'.addcslashes($search, '\\%_').'%';

            $query->where(function (Builder $query) use ($like) {
                $query->where('title', 'like', $like)
                    ->orWhere('description', 'like', $like);
            });
        }

        $query->getQuery()->orders = null;

        $statusOrder = $query->getConnection()->getDriverName() === 'mysql'
            ? "FIELD(status, 'pending', 'approved', 'rejected')"
            : "CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END";

        $query->orderByRaw($statusOrder);

        if ($sort) {
            foreach ($sort as $field => $direction) {
                if ($field === 'status') {
                    continue;
                }

                if ($field === 'submittedAt') {
                    $query->orderBy('submitted_at', $direction);
                } elseif ($field === 'approvedAt') {
                    $query->orderBy('approved_at', $direction);
                }
            }
        } else {
            $query->orderBy('submitted_at', 'desc');
        }

        if ($pagination && method_exists($pagination, 'apply')) {
            $pagination->apply($query);
        }

        return $context->withQuery($query);
    }

    private function canWriteItem(DependencyItem $item, FlarumContext $context): bool
    {
        if ($context->creating()) {
            return $context->getActor()->hasPermission('dependency-collector.submit');
        }

        return $context->updating() && $context->getActor()->can('edit', $item);
    }

    private function isFavorited(DependencyItem $item, FlarumContext $context): bool
    {
        $actor = $context->getActor();

        if ($actor->isGuest()) {
            return false;
        }

        if ($item->relationLoaded('favoritedByUsers')) {
            return $item->favoritedByUsers->contains(fn ($user) => (int) $user->id === (int) $actor->id);
        }

        return $item->favoritedByUsers()->where('users.id', $actor->id)->exists();
    }
}
