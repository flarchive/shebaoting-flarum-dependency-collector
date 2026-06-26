// js/src/forum/components/DependencyListPage.js

import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import DependencyItemCard from './DependencyItemCard';
import SubmitDependencyModal from './SubmitDependencyModal';
import classList from 'flarum/common/utils/classList';
import { getPlainContent } from 'flarum/common/utils/string';

export default class DependencyListPage extends Page {
  oninit(vnode) {
    super.oninit(vnode);

    this.loadingItems = true;
    this.loadingMore = false;
    this.items = [];
    this.tags = app.store.all('dependency-tags') || [];
    this.moreResults = false;
    this.currentTagFilter = m.route.param('tagSlug') || null;
    this.showingFavorites = m.route.param('filter') === 'favorites';
    this.searchQuery = '';
    this.searchTimer = null;
    this.loadRequestId = 0;

    if (this.tags.length === 0) {
      this.loadingTags = true;
      this.loadTags();
    } else {
      this.loadingTags = false;
    }

    this.loadResults(0);
  }

  oncreate(vnode) {
    super.oncreate(vnode);
    app.setTitle(app.translator.trans('shebaoting-dependency-collector.forum.nav_title'));
    app.setTitleCount(0);
  }

  onbeforeupdate(vnode, old) {
    super.onbeforeupdate(vnode, old);

    const newTagFilter = m.route.param('tagSlug') || null;
    const newShowingFavorites = m.route.param('filter') === 'favorites';

    if (newTagFilter !== this.currentTagFilter || newShowingFavorites !== this.showingFavorites) {
      this.currentTagFilter = newTagFilter;
      this.showingFavorites = newShowingFavorites;
      this.loadResults(0);
      return false;
    }
    return true;
  }

  view() {
    return (
      <div className="DependencyListPage">
        <div className="container">
          <div className="DependencyCollectorToolbar">
            {app.session.user && app.forum?.attribute('canSubmitDependencyCollectorItem') && (
              <Button
                className="Button Button--primary DependencyCollectorToolbar-button"
                icon="fas fa-plus"
                onclick={() =>
                  app.modal.show(SubmitDependencyModal, {
                    onsubmit: () => this.loadResults(0),
                  })
                }
              >
                {app.translator.trans('shebaoting-dependency-collector.forum.list.submit_button')}
              </Button>
            )}

            {app.session.user && app.forum?.attribute('canFavoriteDependencyCollectorItemGlobal') && (
              <Button
                className={classList('Button DependencyCollectorToolbar-button', this.showingFavorites && 'active')}
                icon="fas fa-star"
                onclick={this.showMyFavorites.bind(this)}
              >
                {app.translator.trans('shebaoting-dependency-collector.forum.list.my_favorites_button')}
              </Button>
            )}

            <div className="DependencyCollectorSearch">
              <input
                className="FormControl DependencyCollectorSearch-input"
                type="search"
                value={this.searchQuery}
                placeholder={app.translator.trans('shebaoting-dependency-collector.forum.list.search_placeholder')}
                aria-label={app.translator.trans('shebaoting-dependency-collector.forum.list.search_placeholder')}
                oninput={this.onSearchInput.bind(this)}
              />
            </div>
          </div>

          <div className="DependencyCollectorTags">
            {this.loadingTags && !this.tags.length ? (
              <LoadingIndicator />
            ) : (
              <ul className="DependencyListTags">
                <li className={classList('TagLink item-allDiscussions', !this.currentTagFilter && !this.showingFavorites && 'active')}>
                  <a
                    href={app.route('dependency-collector.forum.index')}
                    onclick={(e) => {
                      e.preventDefault();
                      if (this.currentTagFilter || this.showingFavorites) {
                        m.route.set(app.route('dependency-collector.forum.index'));
                      }
                    }}
                  >
                    <span className="TagLink-name">{app.translator.trans('shebaoting-dependency-collector.forum.list.all_tags')}</span>
                  </a>
                </li>
                {this.tags && this.tags.length > 0
                  ? this.tags.map((tag) => (
                      <li
                        key={tag.id()}
                        className={classList('TagLink item-allDiscussions', this.currentTagFilter === tag.slug() && !this.showingFavorites && 'active')}
                      >
                        <a
                          href={app.route('dependency-collector.forum.index', { tagSlug: tag.slug() })}
                          onclick={(e) => {
                            e.preventDefault();
                            if (this.currentTagFilter !== tag.slug() || this.showingFavorites) {
                              m.route.set(app.route('dependency-collector.forum.index', { tagSlug: tag.slug() }));
                            }
                          }}
                        >
                          {tag.icon() && <i className={tag.icon() + ' TagLink-icon'}></i>}
                          <span className="TagLink-name">{tag.name()}</span>
                        </a>
                      </li>
                    ))
                  : !this.loadingTags && (
                      <li className="TagLink disabled">
                        <span className="TagLink-name">{app.translator.trans('shebaoting-dependency-collector.forum.list.no_tags')}</span>
                      </li>
                    )}
              </ul>
            )}
          </div>

          <div className="DependencyCollectorContent">
            {this.loadingItems && this.items.length === 0 ? (
              <LoadingIndicator display="block" />
            ) : this.items && this.items.length > 0 ? (
              <div className="DependencyList">
                {this.items.map((item) => (
                  <DependencyItemCard item={item} key={item.id()} onchange={() => this.loadResults(0)} />
                ))}
              </div>
            ) : (
              !this.loadingItems && <p className="DependencyList-empty">{app.translator.trans('shebaoting-dependency-collector.forum.list.empty_text')}</p>
            )}

            {this.moreResults && (
              <div className="DependencyList-loadMore">
                <Button className="Button" onclick={this.loadMore.bind(this)} loading={this.loadingMore}>
                  {app.translator.trans('core.forum.discussion_list.load_more_button')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  normalizeResults(results) {
    if (Array.isArray(results)) {
      return results.filter(Boolean);
    }

    if (results && Array.isArray(results.data)) {
      return results.data.filter(Boolean);
    }

    return [];
  }

  hasMoreResults(payload, items) {
    if (payload?.links) {
      return !!payload.links.next;
    }

    if (payload?.payload?.links) {
      return !!payload.payload.links.next;
    }

    return items.length >= 20;
  }

  queryString(params = {}) {
    const query = new URLSearchParams();

    if (params.include) query.set('include', params.include);
    if (params.sort) query.set('sort', params.sort);

    Object.entries(params.page || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.set(`page[${key}]`, value);
      }
    });

    Object.entries(params.filter || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== false && value !== '') {
        query.set(`filter[${key}]`, value);
      }
    });

    const text = query.toString();

    return text ? `?${text}` : '';
  }

  loadCollection(type, params) {
    return app
      .request({
        method: 'GET',
        url: `${app.forum.attribute('apiUrl')}/${type}${this.queryString(params)}`,
      })
      .then((payload) => ({
        payload,
        models: this.modelsFromPayload(type, payload),
      }));
  }

  modelsFromPayload(type, payload) {
    const pushedModels = this.normalizeResults(app.store.pushPayload(payload));

    if (pushedModels.length || !Array.isArray(payload?.data)) {
      return pushedModels;
    }

    return payload.data.map((resource) => this.fallbackModel(type, resource, payload.included || [])).filter(Boolean);
  }

  fallbackModel(type, resource, included) {
    if (type === 'dependency-items') {
      return this.fallbackItem(resource, included);
    }

    if (type === 'dependency-tags') {
      return this.fallbackTag(resource);
    }

    return null;
  }

  includedResource(included, type, id) {
    return included.find((resource) => resource.type === type && String(resource.id) === String(id));
  }

  fallbackTag(resource) {
    const attrs = resource.attributes || {};

    return {
      id: () => resource.id,
      name: () => attrs.name || '',
      slug: () => attrs.slug || '',
      color: () => attrs.color || null,
      icon: () => attrs.icon || null,
    };
  }

  fallbackItem(resource, included) {
    const attrs = resource.attributes || {};
    const relationships = resource.relationships || {};
    const tagLinks = relationships.tags?.data || [];
    const userLink = relationships.user?.data;
    const user = userLink ? app.store.getById('users', userLink.id) || null : null;
    const tags = tagLinks
      .map((tagLink) => app.store.getById('dependency-tags', tagLink.id) || this.fallbackTag(this.includedResource(included, tagLink.type, tagLink.id) || tagLink))
      .filter(Boolean);
    const submittedAt = attrs.submittedAt ? new Date(String(attrs.submittedAt).replace(' ', 'T')) : null;

    return {
      id: () => resource.id,
      title: () => attrs.title || '',
      link: () => attrs.link || '#',
      description: () => attrs.description || '',
      status: () => attrs.status || '',
      submittedAt: () => submittedAt,
      user: () => user,
      tags: () => tags,
      canEdit: () => false,
      canApprove: () => false,
      canDelete: () => false,
      isFavorited: () => !!attrs.isFavorited,
      canFavorite: () => false,
      shortDescription: (length = 100) => {
        const description = attrs.description || '';
        const plain = getPlainContent(description);

        return plain.substring(0, length) + (plain.length > length ? '...' : '');
      },
    };
  }

  loadResults(offset = 0) {
    if (offset === 0) {
      this.loadingItems = true;
      this.items = [];
      this.moreResults = false;
      m.redraw();
    } else {
      this.loadingMore = true;
      m.redraw();
    }

    const params = {
      page: { offset, limit: 20 },
      sort: '-approvedAt',
      include: 'user,tags,approver,favoritedByUsers',
      filter: {},
    };

    if (this.showingFavorites) {
      params.filter.isFavorite = true;
    } else if (this.currentTagFilter) {
      params.filter.tag = this.currentTagFilter;
    }

    const searchQuery = this.searchQuery.trim();
    if (searchQuery) {
      params.filter.q = searchQuery;
    }

    const requestId = ++this.loadRequestId;

    return this.loadCollection('dependency-items', params)
      .then(({ payload, models }) => {
        if (requestId !== this.loadRequestId) return;

        const items = models;

        if (items.length || Array.isArray(payload?.data)) {
          this.items = offset === 0 ? items : this.items.concat(items);
          this.moreResults = this.hasMoreResults(payload, items);
        } else {
          if (offset === 0) this.items = [];
          this.moreResults = false;
        }
      })
      .catch((error) => {
        if (requestId !== this.loadRequestId) return;

        console.error('Error loading dependency items:', error);
        if (offset === 0) this.items = [];
        this.moreResults = false;
        app.alerts.show({ type: 'error' }, app.translator.trans('shebaoting-dependency-collector.forum.list.load_error'));
      })
      .finally(() => {
        if (requestId !== this.loadRequestId) return;

        this.loadingItems = false;
        this.loadingMore = false;
        m.redraw();
      });
  }

  loadTags() {
    this.loadingTags = true;
    m.redraw();

    this.loadCollection('dependency-tags', { sort: 'name' })
      .then(({ models }) => {
        this.tags = models.length ? models : app.store.all('dependency-tags');
      })
      .catch((error) => {
        console.error('Error loading tags:', error);
        this.tags = [];
        app.alerts.show({ type: 'error' }, app.translator.trans('shebaoting-dependency-collector.forum.list.load_tags_error'));
      })
      .finally(() => {
        this.loadingTags = false;
        const storeTags = app.store.all('dependency-tags');
        this.tags = this.tags.length ? this.tags : Array.isArray(storeTags) ? storeTags : [];
        m.redraw();
      });
  }

  loadMore() {
    if (this.loadingItems || this.loadingMore) return;
    this.loadResults(this.items.length);
  }

  onSearchInput(event) {
    this.searchQuery = event.target.value;

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.searchTimer = null;
      this.loadResults(0);
    }, 250);
  }

  onremove(vnode) {
    super.onremove(vnode);

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }

  showMyFavorites() {
    if (!this.showingFavorites) {
      m.route.set(app.route('dependency-collector.forum.index', { filter: 'favorites' }));
    } else {
      m.route.set(app.route('dependency-collector.forum.index'));
    }
  }
}
