/**
* @Date:   2016-06-17T16:39:09+08:00
* @Last modified time: 2016-07-05T19:09:38+08:00
*/

/**
 * Tree
 * @require Jquery
 */
import {
  Widget
} from "../component.js";
import React from 'react';
import ReactDom from 'react-dom';
import style from './tree.css';

class Tree extends Widget {
  constructor(props) {
    super(props);
    this.adaptOptionStatus(props);
    this.state = {};
  }
  componentDidMount() {
    this.renderTid = null;  //用于延时加载
  }
  componentWillReceiveProps(nextProps) {
    this.adaptOptionStatus(nextProps);
  }
  componentWillUnmount() {
    clearTimeout(this.renderTid);
    this.renderTid = null;
  }
  adaptOptionStatus(props) {
    //处理半勾选状态
    loop(props.options);

    function loop(options, forceCheck) {
      options.forEach((itemData) => {
        if (forceCheck) { //直接选中所有的子节点
          itemData.checkedStatus = 'checked';
        }
        if (itemData.checkedStatus === 'checked') {
          if (itemData.children && itemData.children.length) {
            loop(itemData.children, true);
          }
        } else {
          if (itemData.children && itemData.children.length) {
            loop(itemData.children);
            let checkedCounts = 0;
            let halfCheckedCounts = 0;
            itemData.children.forEach((itemData) => {
              if (itemData.checkedStatus === 'checked') {
                checkedCounts++;
              }
              if (itemData.checkedStatus === 'halfChecked') {
                halfCheckedCounts++;
              }
            });
            if (checkedCounts === 0) {  //没有子节点被checked
              if (halfCheckedCounts > 0) {
                itemData.checkedStatus = 'halfChecked';
              } else {
                itemData.checkedStatus = 'unchecked';
              }
            } else {
              if (checkedCounts === itemData.children.length) { //全部子节点被checked
                itemData.checkedStatus = 'checked';
              } else {  //部分子节点被checked
                itemData.checkedStatus = 'halfChecked';
              }
            }
          }
        }
      });
    }
  }
  /**
   * Node check handler
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  handleOptionCheck(option) {
    const props = this.props;
    let options = [].concat(props.options);
    option.checkedStatus = (option.checkedStatus === 'checked' ? 'unchecked' : 'checked');
    //反选其它node
    if (props.checkMode === 'single') {
      uncheckOtherNode(options);
    }
    //同步状态
    syncStatusLoop(options);
    //向上向下控制
    function uncheckOtherNode(options) {
      options.forEach((itemData) => {
        if (itemData.value !== option.value) {
          itemData.checkedStatus = 'unchecked';
        }
        if (itemData.children && itemData.children.length) {
          uncheckOtherNode(itemData.children);
        }
      });
    }
    function syncStatusLoop(options, checkedStatus) {
      options.forEach((itemData) => {
        if (itemData.value === option.value) {  //处理当前节点
          itemData.children && itemData.children.length && syncStatusLoop(itemData.children, itemData.checkedStatus);
        } else {  //处理其它节点
          if (typeof checkedStatus !== 'undefined') { //children lookup
            itemData.checkedStatus = checkedStatus;
            itemData.children && itemData.children.length && syncStatusLoop(itemData.children, checkedStatus);
          } else {  //parent lookup
            let checkedCounts = 0;
            let halfCheckedCounts = 0;
            if (itemData.children && itemData.children.length) {
              syncStatusLoop(itemData.children);
              itemData.children.forEach((itemData) => {
                if (itemData.checkedStatus === 'checked') {
                  checkedCounts++;
                }
                if (itemData.checkedStatus === 'halfChecked') {
                  halfCheckedCounts++;
                }
              });
              if (checkedCounts === 0) {  //没有子节点被checked
                if (halfCheckedCounts > 0) {
                  itemData.checkedStatus = 'halfChecked';
                } else {
                  itemData.checkedStatus = 'unchecked';
                }
              } else {
                if (checkedCounts === itemData.children.length) { //全部子节点被checked
                  itemData.checkedStatus = 'checked';
                } else {  //部分子节点被checked
                  itemData.checkedStatus = 'halfChecked';
                }
              }
            }
          }
        }
      });
    }
    props.onOptionsChange(options); //反射
  }
  handleOptionFold(option) {
    const props = this.props;
    const self = this;
    let options = props.options;
    option.foldStatus = (option.foldStatus === 'unfold' ? 'fold' : 'unfold');
    clearTimeout(this.renderTid);
      // props.onOptionsChange([].concat(options)); //反射
      // return;
    if (option.foldStatus === 'unfold') { //分时渲染调优性能
      if (option.children.length > 50) {
        //let totalChildren = option.children;
        let counts = Math.ceil(option.children.length / 50.0);
        let i = 0;
        //option.children = [];
        let loop = function () {
          self.renderTid = setTimeout(() => {
            //option.children = option.children.concat(totalChildren.slice(i * 100, 100));
            option.children.slice(i * 50, (i + 1) * 50).forEach((itemData) => {
              itemData.rendered = true;
            });
            props.onOptionsChange([].concat(options)); //反射
            i++;
            if (i < counts) {
              loop();
            }
          }, 0);
        };
        loop();
      } else {
        option.children.forEach((itemData) => {
          itemData.rendered = true;
        });
        props.onOptionsChange([].concat(options)); //反射
      }
    } else {
      option.children.forEach((itemData) => {
        itemData.rendered = false;
      });
      props.onOptionsChange([].concat(options)); //反射
    }
  }
  render() {
    const props = this.props;
    const state = this.state;
    const prefixCls = props.prefixCls;
    const options = props.options;
    const self = this;
    return (<div className={ `${prefixCls} ${props.className || ''}`}>
      {
        (function loop(options, level) {
          return (<ul className={`${prefixCls}-list list-${level}`}>
            {
              options.map((itemData, i) => {
                //var nodeCheckedCls = '';  //节点选中状态：空/半选/全选
                return ((level === 0 || itemData.rendered) ? (<li className={`${prefixCls}-item item-${level}`} key={i}>
                  <div className={`${prefixCls}-node`}>
                    {(itemData.children && itemData.children.length) ? <span className={`${prefixCls}-node-foldder ${prefixCls}-node-foldder-${itemData.foldStatus || 'fold'}`} onClick={self.handleOptionFold.bind(self, itemData)}>{Tree.getFoldderTextFromStatus(itemData.foldStatus)}</span> : <span className={`${prefixCls}-node-foldder`}></span>}
                    {itemData.checkType === 'checkbox' ? <span className={`${prefixCls}-node-checkbox ${prefixCls}-node-checkbox-${itemData.checkedStatus || 'unchecked'}`} onClick={self.handleOptionCheck.bind(self, itemData)}>{Tree.getCheckboxTextFromStatus(itemData.checkedStatus)}</span> : null}
                    <span className={`${prefixCls}-node-text`} title={itemData.text}>&nbsp;{itemData.text}</span></div>
                  {(itemData.foldStatus === 'unfold' && itemData.children && itemData.children.length) ? <div className={`${prefixCls}-children`}>
                    {
                      (function () {
                        return loop(itemData.children, level + 1);
                      }())
                    }
                  </div> : null}
                </li>) : null);
              })
            }
          </ul>);
        }(options, 0))
      }
    </div>);
  }
}
Tree.getCheckboxTextFromStatus = function (status) {
  var text = '';
  switch (status) {
    case 'checked':
      text = '√';
    break;
    case 'halfChecked':
      text = '－';
    break;
    case 'unchecked':
      text = '';
    break;
    default:
    break;
  }
  return text;
};
Tree.getFoldderTextFromStatus = function (status) {
  var text = '';
  switch (status) {
    case 'unfold':
      text = '－';
    break;
    case 'fold':
    default:
      text = '＋';
    break;
  }
  return text;
};
Tree.propTypes = {
  prefixCls: React.PropTypes.string,
  className: React.PropTypes.string,
  checkMode: React.PropTypes.string,
  options: React.PropTypes.array,
  onOptionsChange: React.PropTypes.func
};
Tree.defaultProps = {
  prefixCls: 'ui-tree',
  className: '',
  checkMode: 'multi', //multi or single
  options: [],  //{value, text, checkedstatus, checkType} checkedStatus取值checked，halfChecked,unchecked(默认) checkType取值none(默认),checkbox
  onOptionsChange: () => {}
};

export default Tree;
