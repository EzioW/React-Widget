/**
 * Dialog组件实现
 */
import {
    Widget
} from "../component.js";
import React from 'react';
import TitleBar from './TitleBar.js';
import ActionBar from './ActionBar.js';
import Pane from './Pane.js';

// 对话框组件
class Dialog extends Pane {
  static defaultProps = { ...Object.getPrototypeOf(Dialog).defaultProps,
    prefixCls: 'ui-dialog',
    className : 'ui-dialog-outer',
    classPaneOuter : 'ui-dialog-pane-outer',
    hasTitleBar: true,
    hasActionBar: true,
    // version: '2015.12.10',
  }
  constructor(props) {
    super(props);
  }
  jsxElementToRender() {
    const {className, hasTitleBar, hasActionBar, title, actionContent, ...otherProps} = this.props;
    let jsxTitlebar = !this.props.hasTitleBar ? null : (<TitleBar 
      title={this.props.title} 
      onClickClose={this.props.onClickClose} />);
    let jsxActionbar = !this.props.hasActionBar ? null : (<ActionBar 
      actionContent={this.props.actionContent} onClickClose={this.props.onClickClose} onClickSubmit={this.props.onClickSubmit} />);
    return (<div name="RCZDialog" className={this.props.className} style={this.props.styleTmpl}>
      {this.renderCustom(otherProps, super.jsxElementToRender)}
      {jsxActionbar}
      {jsxTitlebar}
    </div>);
  }
}

export default Dialog;

