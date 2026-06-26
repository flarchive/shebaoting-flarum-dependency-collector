import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';
import DependencyCollectorSettingsPage from './components/DependencyCollectorSettingsPage';
import DependencyItem from '../common/models/DependencyItem';
import DependencyTag from '../common/models/DependencyTag';

export default [
  new Extend.Store().add('dependency-items', DependencyItem).add('dependency-tags', DependencyTag),
  new Extend.Admin()
    .page(DependencyCollectorSettingsPage)
    .permission(
      () => ({
        icon: 'fas fa-pencil-alt',
        label: app.translator.trans('shebaoting-dependency-collector.admin.permissions.submit_label'),
        permission: 'dependency-collector.submit',
      }),
      'start',
      90
    )
    .permission(
      () => ({
        icon: 'fas fa-check-double',
        label: app.translator.trans('shebaoting-dependency-collector.admin.permissions.moderate_label'),
        permission: 'dependency-collector.moderate',
        allowGuest: false,
      }),
      'moderate',
      90
    )
    .permission(
      () => ({
        icon: 'fas fa-tags',
        label: app.translator.trans('shebaoting-dependency-collector.admin.permissions.manage_tags_label'),
        permission: 'dependency-collector.manageTags',
      }),
      'moderate',
      80
    )
    .permission(
      () => ({
        icon: 'fas fa-star',
        label: app.translator.trans('shebaoting-dependency-collector.admin.permissions.favorite_items_label'),
        permission: 'dependency-collector.favoriteItems',
      }),
      'view',
      80
    ),
];
