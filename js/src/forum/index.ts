import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import LinkButton from 'flarum/common/components/LinkButton';

export { default as extend } from './extend';

app.initializers.add('shebaoting-dependency-collector', () => {
  extend(IndexSidebar.prototype, 'navItems', (items) => {
    items.add(
      'dependency-collector',
      LinkButton.component(
        {
          href: app.route('dependency-collector.forum.index'),
          icon: 'fas fa-cubes',
        },
        app.translator.trans('shebaoting-dependency-collector.forum.nav_title')
      ),
      85
    );
  });
});
