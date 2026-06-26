import Extend from 'flarum/common/extenders';
import DependencyItem from '../common/models/DependencyItem';
import DependencyTag from '../common/models/DependencyTag';
import DependencyListPage from './components/DependencyListPage';

export default [
  new Extend.Store().add('dependency-items', DependencyItem).add('dependency-tags', DependencyTag),
  new Extend.Routes().add('dependency-collector.forum.index', '/dependencies', DependencyListPage),
];
