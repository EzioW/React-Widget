/**
 * Uploader
 * @require Jquery
 */
import {
  Widget
} from "../component.js";
import React from 'react';
import ReactDom from 'react-dom';
import style from './uploader.css';

class Uploader extends Widget {
  constructor(props) {
    super(props);
    this.state = {
      filePath: ''
    };
  }
  componentDidMount() {}
  componentWillUnmount() {}
  uploadFile() {
    const props = this.props;
    const state = this.state;
    const prefixCls = props.prefixCls;
    var self = this;
    var ifrEl = $(`${prefixCls}-ifr`);
    var form = this.refs.form;
    var filePath = state.filePath;
    if (!ifrEl.length) {
      ifrEl = $(`<iframe name="upload-result-iframe" class="${prefixCls}-ifr"/>`);
      ifrEl.css({
        position: 'absolute',
        top: '-10000px',
        left: '-10000px'
      }).appendTo('body');
    }
    form.setAttribute('target', 'upload-result-iframe');
    if (filePath) { //有值的情况下才会上传
      ifrEl[0].onload = function() {
        var responseText = $(ifrEl[0].contentWindow.document.body).text(),
          responseData;
        try {
          responseData = JSON.parse(responseText);
          ifrEl[0].onload = null;
          ifrEl.remove(); //每次都重新创建
          if (responseData.flag) {
            props.onSuccess(responseData.data);
          } else {
            self.setState({
              filePath: ''
            }, () => {
              props.onChange('');
            });
            props.onFailure(responseData);
          }
        } catch(evt) {
          self.setState({
            filePath: ''
          }, () => {
            props.onChange('');
          });
          props.onFailure({
            flag: 0,
            message: evt.message
          });
        }
      };
      form.submit();
    }
  }
  upload() {
    if (this.state.filePath) {
      this.uploadFile();
    }
  }
  handleChange(evt) {
    const props = this.props;
    let value = evt.target.value;
    if (props.autoUpload) {  //自动上传
      this.setState({
        filePath: value
      }, () => {
        props.onChange(value);
        this.uploadFile();
      });
    } else {
      this.setState({
        filePath: value
      }, () => {
        props.onChange(value);
      });
    }
  }
  render() {
    const props = this.props;
    const state = this.state;
    const prefixCls = props.prefixCls;
    var requestData = props.requestData;

    return (<div className={ `${prefixCls} ${props.className || ''}`} style={{
        width: props.width,
        height: props.height
      }}>
      <form className={`${prefixCls}-form`} action={props.url} ref="form" method="post" encType="multipart/form-data">
        <input type="file" value={state.filePath} accept={props.accept} name={props.fieldName} className={`${prefixCls}-file`} onChange={this.handleChange.bind(this)} />
        {!requestData ? null :
            Object.keys(requestData).map((i,x)=>
                (<input type="hidden" key={x} name={i} value={requestData[i]} />))}
      </form>
      <div className={`${prefixCls}-handler`}>{props.children}</div>
    </div>);
  }
}
Uploader.propTypes = {
  requestData: React.PropTypes.object,
  url: React.PropTypes.string,
  text: React.PropTypes.string,
  fieldName: React.PropTypes.string,
  accept: React.PropTypes.string,
  className: React.PropTypes.string,
  onChange: React.PropTypes.func,
  onProgress: React.PropTypes.func,
  onSuccess: React.PropTypes.func,
  onFailure: React.PropTypes.func
};
Uploader.defaultProps = {
  prefixCls: 'ui-uploader',
  className: '',
  autoUpload: true,  //自定上传
  width: 'auto',
  height: 'auto',
  fieldName: 'file',
  accept: '*',
  onChange: () => {},
  onProgress: () => {},
  onSuccess: () => {},
  onFailure: () => {}
};

export default Uploader;
