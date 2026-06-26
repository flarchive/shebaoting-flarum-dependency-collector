// js/src/admin/components/EditTagModal.js

import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import Stream from 'flarum/common/utils/Stream';
import ColorPreviewInput from 'flarum/common/components/ColorPreviewInput';
import app from 'flarum/admin/app';

export default class EditTagModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.tag = this.attrs.tag || app.store.createRecord('dependency-tags');

    this.name = Stream(this.tag.name() || '');
    this.slug = Stream(this.tag.slug() || '');
    this.description = Stream(this.tag.description() || '');
    this.color = Stream(this.tag.color() || '#cccccc');
    this.icon = Stream(this.tag.icon() || '');

    this.alertAttrs = null;
  }

  className() {
    return 'EditTagModal Modal--small';
  }

  title() {
    return this.tag.exists
      ? app.translator.trans('shebaoting-dependency-collector.admin.modal.edit_tag_title', { name: this.tag.name() })
      : app.translator.trans('shebaoting-dependency-collector.admin.modal.create_tag_title');
  }

  content() {
    // 策略：移除 content() 内部所有元素的 key 属性，
    // 依赖 Mithril 对无 key 列表的处理。
    // Modal-body 和 Form 保持无 key。
    // 所有 Form-group 也保持无 key。
    // 对于 app.translator.trans 返回的数组，如果其内部的 <a> 也没有 key，
    // 那么整个子数组就是“无 key”的，这应该是允许的。
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            {' '}
            {/* NO KEY */}
            <label>{app.translator.trans('shebaoting-dependency-collector.admin.modal.tag_name_label')}</label>
            <input className="FormControl" bidi={this.name} />
          </div>
          <div className="Form-group">
            {' '}
            {/* NO KEY */}
            <label>{app.translator.trans('shebaoting-dependency-collector.admin.modal.tag_slug_label')}</label>
            <input className="FormControl" bidi={this.slug} />
          </div>
          <div className="Form-group">
            {' '}
            {/* NO KEY */}
            <label>{app.translator.trans('shebaoting-dependency-collector.admin.modal.tag_description_label')}</label>
            <textarea className="FormControl" bidi={this.description} rows="3"></textarea>
          </div>
          <div className="Form-group">
            {' '}
            {/* NO KEY */}
            <label>{app.translator.trans('shebaoting-dependency-collector.admin.modal.tag_color_label')}</label>
            <ColorPreviewInput className="FormControl" bidi={this.color} />
          </div>
          <div className="Form-group">
            {' '}
            {/* NO KEY */}
            <label>{app.translator.trans('shebaoting-dependency-collector.admin.modal.tag_icon_label')}</label>
            <div className="DependencyCollectorIconPicker">
              <input className="FormControl DependencyCollectorIconInput" bidi={this.icon} placeholder="fas fa-code" />
              <Select
                options={this.iconOptions()}
                value={this.icon() || 'fas fa-code'}
                onchange={(value) => {
                  this.icon(value);
                  m.redraw();
                }}
              />
              <span className="DependencyCollectorIconPreview">
                <i className={this.icon() || 'fas fa-code'}></i>
              </span>
            </div>
            <small>
              {' '}
              {/* NO KEY on small, and no key on inner <a> */}
              {app.translator.trans('shebaoting-dependency-collector.admin.modal.tag_icon_help', {
                a: ({ children }) => (
                  <a href="https://fontawesome.com/icons" tabindex="-1" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              })}
            </small>
          </div>
          <div className="Form-group">
            {' '}
            {/* NO KEY */}
            <Button
              type="submit"
              className="Button Button--primary"
              loading={this.loading}
              aria-label={app.translator.trans('shebaoting-dependency-collector.admin.modal.save_button')}
            >
              {app.translator.trans('shebaoting-dependency-collector.admin.modal.save_button')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  iconOptions() {
    const options = {
      'fas fa-code': this.iconOptionLabel('code', 'Code'),
      'fas fa-cube': this.iconOptionLabel('cube', 'Package'),
      'fas fa-layer-group': this.iconOptionLabel('layer_group', 'Layers'),
      'fas fa-puzzle-piece': this.iconOptionLabel('puzzle_piece', 'Plugin'),
      'fas fa-toolbox': this.iconOptionLabel('toolbox', 'Tools'),
      'fas fa-palette': this.iconOptionLabel('palette', 'Design'),
      'fas fa-database': this.iconOptionLabel('database', 'Database'),
      'fas fa-cloud': this.iconOptionLabel('cloud', 'Cloud'),
      'fas fa-mobile-alt': this.iconOptionLabel('mobile', 'Mobile'),
      'fas fa-shield-alt': this.iconOptionLabel('shield', 'Security'),
      'fas fa-link': this.iconOptionLabel('link', 'Link'),
      'fas fa-star': this.iconOptionLabel('star', 'Featured'),
      'fas fa-bolt': this.iconOptionLabel('bolt', 'Performance'),
      'fas fa-rocket': this.iconOptionLabel('rocket', 'Launch'),
      'fas fa-book': this.iconOptionLabel('book', 'Docs'),
      'fas fa-tags': this.iconOptionLabel('tags', 'Category'),
    };

    const current = this.icon();
    if (current && !options[current]) {
      options[current] = app.translator.trans('shebaoting-dependency-collector.admin.modal.icon_options.current', { icon: current }, true);
    }

    return options;
  }

  iconOptionLabel(key, fallback) {
    const label = app.translator.trans(`shebaoting-dependency-collector.admin.modal.icon_options.${key}`, {}, true);

    return label === `shebaoting-dependency-collector.admin.modal.icon_options.${key}` ? fallback : label;
  }

  onsubmit(e) {
    e.preventDefault();
    this.loading = true;
    this.alertAttrs = null;

    this.tag
      .save({
        name: this.name(),
        slug: this.slug(),
        description: this.description(),
        color: this.color(),
        icon: this.icon(),
      })
      .then(() => {
        if (this.attrs.onsave) this.attrs.onsave();
        this.hide();
      })
      .catch((error) => {
        if (error.alert) {
          this.alertAttrs = error.alert;
        } else {
          console.error(error);
        }
      })
      .finally(() => {
        this.loading = false;
        m.redraw();
      });
  }
}
