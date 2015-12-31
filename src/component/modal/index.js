/**
 * Modal组件实现
 */
import {
    Widget
} from "../component.js";
import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from './Dialog.js';
import './index.css';

let eventNSId = 0;
let instances = [];
const maskEl = $('<div class="ui-modalmask"></div>')[0];

// 模式对话框组件
class Modal extends Widget {
  static PaneType = {
    Popup : Symbol(),
    Dialog : Symbol(),
  };
  static defaultProps = {
    prefixCls: 'ui-modal',
    className: '', // ui-dialog-outer||ui-popup-outer
    title: 'Modal对话框',
    closeText: '取消',
    submitText: '确定',
    width: 600,
    height: 600,
    visible: true,
    paneType: Modal.PaneType.Dialog,
    isLocal: false,
    onClickClose: ()=>{},
    onClickSubmit: ()=>{},
    // onBeforeMount : ()=>{},
    // onAfterMount : ()=>{},
    onBeforeDestroy : ()=>{},
  };
  constructor(props) {
    super(props);
    this.state = {
      parentWidth: $(window).width(),
      parentHeight: $(window).height(),
    };
    this.eventNSId = eventNSId++;
    this.containerNonLocal = null;
  }
  componentWillMount() {
  }
  componentDidMount() {
    this.forceUpdate();

    $(window).on('resize.Modal' + this.eventNSId, (evt)=>{
      this.handleResize.call(this);
    });
    this.handleResize.call(this);
  }
  componentWillReceiveProps(nextProps) {
  }
  componentDidUpdate(prevProps, prevState) {
    if(false == this.props.isLocal) {
      if(!this.containerNonLocal) { // 如果尚未创建global container
        this.containerNonLocal = $('<div style="position:absolute;left:0;top:0;"></div>')[0];
        $(this.containerNonLocal).appendTo(document.body);
      }
      ReactDOM.render(this.getJsxToRender(), this.containerNonLocal, ()=>{
        this.updateMask(this.props.visible)
      });
    }
    else
      this.updateMask(this.props.visible);
  }
  componentWillUnmount() {
    $(window).off('resize.Modal' + this.eventNSId);
    if(this.props.onBeforeDestroy)
      this.props.onBeforeDestroy(this);
  }
  updateMask(propsVisible) {
    if(propsVisible) {
      instances = [...new Set([this, ...instances])]; // map in the instance to array
    }
    else {
      instances = instances.filter((x)=>(x!=this)); // map out the instance from array
    }
    if(instances&&instances[0]) {
      var dom = this.props.isLocal ? ReactDOM.findDOMNode(instances[0]) : instances[0].containerNonLocal;
      $('.ui-modalmaskcontainer', dom).append(maskEl);
      const $parentContainer = this.props.isLocal ? $(dom).parent() : $(window);
      this.setupMaskStyle(maskEl, $parentContainer);
      // $parentContainer.resize(this.setupMaskStyle(maskEl, $parentContainer));
    }
    else {
      if(maskEl.parentNode)
        maskEl.parentNode.removeChild(maskEl);
    }
  }
  setupMaskStyle(maskEl, $parentContainer) {
    $(maskEl).css($parentContainer[0] === window ? {
      position: 'fixed',
      left: '0',
      top: '0',
      width: $(window).width() + 'px',
      height: $(window).height() + 'px',
    } : {
      position: 'absolute',
      left: $parentContainer.offset().left + 'px',
      top: $parentContainer.offset().top+'px',
      width: $parentContainer.width() + 'px',
      height: $parentContainer.height() + 'px',
    });
  }
  handleClose() {
    this.props.onClickClose();
  }
  handleResize() {
    const $parentContainer = this.props.isLocal ? $(ReactDOM.findDOMNode(this)).parent() : $(window);
    this.setState({
      parentWidth: $parentContainer.width(),
      parentHeight: $parentContainer.height(),
    });
  }
  getJsxToRender() {
    const props = this.props;
    let jsxElement = <div></div>;
    const {width, height, visible, paneType, onClickClose, onClickSubmit, onBeforeMount, onAfterMount, onBeforeDestroy, ...otherProps} = this.props;
    const styleTmpl = {};
    // 将组件位置居中
    if(width) {
      styleTmpl.left = (this.state.parentWidth-width)/2;
      styleTmpl.width = width;
    }
    if(height) {
      styleTmpl.top = this.state.parentHeight<height ? 0 : (this.state.parentHeight-height)/2;
      styleTmpl.height = height;
    }

    let jsxPane = null;
    switch(props.paneType) {
      case Modal.PaneType.Popup:
        jsxPane = (<Dialog {...otherProps} prefixCls={props.prefixCls+'-dialog'} hasTitleBar={false} hasActionBar={false}
                      styleTmpl={styleTmpl} onClickClose={props.onClickClose} onClickSubmit={props.onClickSubmit} />);
        break;
      case Modal.PaneType.Dialog:
        jsxPane = (<Dialog {...otherProps} prefixCls={props.prefixCls+'-dialog'} styleTmpl={styleTmpl} onClickClose={props.onClickClose} onClickSubmit={props.onClickSubmit} />);
        break;
      default: break;
    }
    if(props.visible) {
      const classNameString = [...new Set([props.prefixCls, ...(props.className||'').split(' ')])].join(' ');
      jsxElement = (<div name="RCZModal" className={classNameString}>
        <div className="ui-modalmaskcontainer"></div>
        {jsxPane}
      </div>)
    }
    return jsxElement;
  }
  render() {
    // return this.getJsxToRender();
    return this.props.isLocal ? this.getJsxToRender() : null;
  }
}

export default Modal;
