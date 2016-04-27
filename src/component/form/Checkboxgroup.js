/**
 * Checkboxgroup组件实现
 */
import {
  Widget
} from "../component.js";
import React from 'react';
import ReactDom from 'react-dom';
import style from './form.css';

class Checkboxgroup extends Widget {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  componentWillUnmount() {}
  handleOptionClick(currentIndex, evt) {
    const self = this;
    const props = self.props;
    if (!props.options[currentIndex].disabled) {
      const targetOptions = $.extend(true, [], props.options);
      targetOptions[currentIndex].checked = !targetOptions[currentIndex].checked;
      self.props.onChange.call(self, {
        // target: self,
        options: targetOptions,
        // __currentIndex: currentIndex,
      });
    }
  }
  render() {
    const props = this.props;
    const state = this.state;
    const prefixCls = props.prefixCls;

    return (<div className={ `${prefixCls} ${props.className || ''}` }>
      {
        props.options.map((option, x) => (
          <div key={ x }
               className={ Checkboxgroup.getOptionClass(prefixCls, option, x) }
               onClick={ this.handleOptionClick.bind(this, x) }>
            { option.text }
          </div>
        ))
      }
    </div>);
  }
}
Checkboxgroup.getOptionClass = function(prefixCls, option, x) {
  let classString = `${prefixCls}-option ${prefixCls}-option_${x}`;
  if (option.disabled) classString += ` ui-common_disabled`;
  if (option.checked) classString += ` ui-common_selected`;
  return classString;
};
Checkboxgroup.propTypes = {
  prefixCls: React.PropTypes.string,
  className: React.PropTypes.string,
  options: React.PropTypes.array,
  onChange: React.PropTypes.func,
};
Checkboxgroup.defaultProps = {
  prefixCls: 'ui-form-checkboxgroup',
  className: '',
  options: [], // {text: '', value: {}, checked: false, disabled: false }
  onChange: (evt) => {},
};

export default Checkboxgroup;
