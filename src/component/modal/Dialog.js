/**
 * Dialog组件实现
 */
import {
    Widget
} from "../component.js";
import React from 'react';

// 对话框组件
class Dialog extends Widget {
  constructor(props) {
    super(props);
  }
  render() {
    const props = this.props;
    const {prefixCls, hasTitleBar, hasActionBar, title, closeText, submitText, onClickClose, onClickSubmit} = props;
    const titleBarProps = {
      title,
      onClickClose,
    };
    const actionbarProps = {
      closeText,
      submitText,
      onClickClose,
      onClickSubmit,
    };
    const jsxTitlebar = !props.hasTitleBar ? null : (<div className={props.prefixCls+'-titlebar'}>
      <div className={props.prefixCls+'-float-right '+props.prefixCls+'-cmdbutton'} onClick={props.onClickClose}>×</div>
      <div className={props.prefixCls+'-title'} title={props.title}>{props.title}</div>
    </div>);
    const jsxActionbar = !props.hasActionBar ? null : (<div className={props.prefixCls+'-actionbar'}>
      <button className={props.prefixCls+'-btn-cancel'} onClick={props.onClickClose}>{props.closeText}</button>
      <span className={props.prefixCls+'-btn-separater'}></span>
      <button className={props.prefixCls+'-btn-submit'} onClick={props.onClickSubmit}>{props.submitText}</button>
    </div>);
    const jsxPane = (<div className={props.prefixCls+'-pane'}>
      {props.children}
    </div>);
    const classNameString = [...new Set([props.prefixCls, ...(props.className||'').split(' ')])].join(' ');
    return (<div name="RCZDialog" className={classNameString} style={props.styleTmpl}>
      {jsxTitlebar}
      {jsxPane}
      {jsxActionbar}
    </div>);
  }
}
Dialog.defaultProps = {
  prefixCls: 'ui-dialog',
  className: '',
  hasTitleBar: true,
  hasActionBar: true,
  // version: '2015.12.10',
  title : '标题栏',
  closeText: '取消',
  submitText: '确定',
  onClickClose : ()=>{},
  onClickSubmit : ()=>{},
  styleTmpl: undefined,
}
Dialog.propTypes = {
  prefixCls: React.PropTypes.string,
  className: React.PropTypes.string,
  hasTitleBar: React.PropTypes.bool,
  hasActionBar: React.PropTypes.bool,
  // version: React.PropTypes.string,
  title : React.PropTypes.string,
  closeText: React.PropTypes.string,
  submitText: React.PropTypes.string,
  onClickClose : React.PropTypes.func,
  onClickSubmit : React.PropTypes.func,
  styleTmpl: React.PropTypes.object,
};

export default Dialog;

