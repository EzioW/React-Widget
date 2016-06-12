/**
 * 验证组件，多用于表单
 */
import {
  Widget
} from "../component.js";
import React from 'react';
import ReactDom from 'react-dom';

class Validator extends Widget {
  constructor(props) {
    super(props);
    this.state = {
      validateResult: null, //存储验证结果
      diffValueOfFields: [],  //记录value有变化的field name
      fields: {}  //存储rules对应的field相关状态 {name: {isValid: null, message: '', originMessage: ''}}  //如果isValid === false, message为当前提示信息，originMessage记录原始信息
    };
  }
  static validate(field, bindFieldValue) {
    var rule = [].concat(field.rule);
    var message = [].concat(field.message);
    var value = field.value + '';
    var allowBlank = field.allowBlank;
    if (allowBlank) {
      rule = [true, function (v) {
        if (!v) { //如果为空，忽略后面的验证
          return 'abort';
        }
      }].concat(rule);
    }
    //处理不同的rule形式 string/boolean/regx/object/function
    return rule.reduce((pv, cv, ci, arr) => {
      var validateResult;
      if (pv.isAbort) {
        return pv;
      }
      if (typeof cv === 'boolean') {
        validateResult = cv;
      } else if (typeof cv === 'string') {
        let params = [value].concat(bindFieldValue);
        validateResult = Validator.defaultRule[cv](...params);
      } else if (cv instanceof RegExp) {
        validateResult = cv.test(value);
      } else if (typeof cv === 'function') {
        validateResult = cv(value, ...bindFieldValue);
      } else {  //object
        validateResult = Validator.defaultRule[cv['name']](value, cv['params'], ...bindFieldValue);
      }
      //判断结果
      if (validateResult === 'abort') {
        pv.isAbort = true;
        return pv;  //中断的化直接返回前面的验证结果
      } else if (typeof validateResult === 'undefined') {
        return Object.assign(pv, {
          isValid: pv.isValid && true
        });
      } else if (typeof validateResult === 'string') {
        return Object.assign(pv, {
          isValid: pv.isValid && false
        }, (() => {
          if (pv.firstInvalidIndex < 0) {
            return {
              firstInvalidIndex: allowBlank ? (ci - 2) : ci,
              message: validateResult
            };
          }
        })());
      } else if(typeof validateResult === 'boolean') {
        return Object.assign(pv, validateResult, {
          isValid: pv.isValid && validateResult
        }, (() => {
          if (validateResult === false && pv.firstInvalidIndex < 0) {
            return {
              firstInvalidIndex: allowBlank ? (ci - 2) : ci
            };
          }
        })());
      } else {  //认为返回object
        return Object.assign(pv, validateResult, {
          isValid: pv.isValid && validateResult.isValid
        }, (() => {
          if (validateResult.isValid === false && pv.firstInvalidIndex < 0) {
            let rs = {
              firstInvalidIndex: allowBlank ? (ci - 2) : ci
            };
            if (validateResult.message) {
              rs.message = validateResult.message;
            }
            return rs;
          }
        })());
      }
    }, {
      isValid: true,
      isAbort: false,
      firstInvalidIndex: -1, //记录第一个验证未通过的位置
      message: ''
    });
  }
  componentDidMount() {
  }
  componentWillReceiveProps(nextProps) {
    var props = this.props;
    var diffValueOfFields = [];
    Object.keys(props.fields).forEach((k) => {
      if (props.fields[k] !== nextProps.fields[k]) {
        diffValueOfFields.push(k);
      }
    });
    this.setState({
      diffValueOfFields: diffValueOfFields
    });
  }
  componentDidUpdate() {
    this.validate();
  }
  componentWillUnmount() {}
  /**
   * @param excludeEmpty {String} 是否排除空值
   */
  getValidValue (excludeEmpty) {
    var props = this.props;
    var fields = props.fields;
    var values = {};
    Object.keys(fields).forEach((fieldName) => {
      var fieldValidateResult = this.validate(fieldName);
      var value = fields[fieldName].value + ''; 
      if (fieldValidateResult.isValid) {
        if (excludeEmpty) {
          if (value) {
            values[fields[fieldName].name || fieldName] = value;
          }
        } else {
          values[fields[fieldName].name || fieldName] = value;
        }
      }
    });
  }
  validate(fieldName) {
    var props = this.props;
    var state = this.state;
    var fields = props.fields;
    var stateFields = state.fields;
    var diffValueOfFields = state.diffValueOfFields;
    var validateResult = [];
    var returnData;
    if (fieldName) {  //单field验证
      if (fieldName === 'all') {  //all表示验证所有fields
        diffValueOfFields = Object.keys(fields);
      } else if (fields[fieldName]) {
        diffValueOfFields = [];
        diffValueOfFields.push(fieldName);
      }
    }    //验证value有差异的field，只要有一个没通过验证就算没通过
    diffValueOfFields.forEach((fieldName) => {
      validateField(fieldName);
    });
    function validateField(fieldName) {
      let bindField = [].concat(fields[fieldName].bindField || []);
      bindField = bindField.map((fieldName) => {
        return fields[fieldName].value + '';
      });
      let stateField = state.fields[fieldName] || {};
      let fieldValidateResult = Validator.validate(fields[fieldName], bindField);
      !stateField.originMessage && (stateField.originMessage = [].concat(fields[fieldName].message));
      if (!fieldValidateResult.isValid && !fieldValidateResult.message) {
        fieldValidateResult.message = stateField.originMessage[fieldValidateResult.firstInvalidIndex];  //如果验证过程没返回message，那么从默认message里取
      }
      fieldValidateResult.fieldName = fieldName;
      //存储验证结果
      let newFields = {};
      newFields[fieldName] = stateField;
      if (fields[fieldName].onValidate && stateField.isValid !== fieldValidateResult.isValid && stateField.message !== fieldValidateResult.message) {
        fields[fieldName].onValidate(fieldValidateResult.isValid, fieldValidateResult);
      }
      stateField.isValid = fieldValidateResult.isValid;
      //更新message
      stateField.message = fieldValidateResult.message;
      Object.assign(stateFields, newFields);
      validateResult.push(fieldValidateResult);
    }
    //存储新的内部状态
    this.setState({
      fields: stateFields
    });
    //过滤出没通过验证的
    let validateErrorResult = validateResult.filter((itemData) => {
      return !itemData.isValid;
    });
    let newFields = {};

    if (validateErrorResult.length) {
      returnData = {
        isValid: false,
        fieldName: validateErrorResult[0].fieldName,
        message: validateErrorResult[0].message,
        validateErrorResult: validateErrorResult
      };
      diffValueOfFields.forEach((k) => {
        var fieldValidateResult = validateErrorResult.find((itemData) => {
          return itemData.fieldName === k;
        }) || {
          isValid: true,
          message: ''
        };
        newFields[k] = Object.assign({}, fields[k], {
          isValid: fieldValidateResult.isValid,
          message: fieldValidateResult.message
        });
      });
    } else {
      returnData = {
        isValid: true
      };
      diffValueOfFields.forEach((k) => {
        newFields[k] = Object.assign({}, fields[k], {
          isValid: true,
          message: ''
        });
      });
    }
    //合并未受影响的field反射回去
    Object.keys(fields).forEach((k) => {
      if (!newFields[k]) {
        newFields[k] = fields[k];
      }
    });
    if (JSON.stringify(newFields) !== JSON.stringify(fields)) {
      props.onFieldsChange(newFields);
    }
    //构建整体验证结果
    returnData = Object.keys(stateFields).reduce((pv, cv) => {
      pv.isValid = pv.isValid && stateFields[cv].isValid;
      if (!stateFields[cv].isValid) {
        pv.fieldName = pv.fieldName || [];
        pv.fieldName.push(cv);
        pv.message = pv.message || [];
        pv.message.push(stateFields[cv].message);
      }
      return pv;
    }, {
      isValid: true
    });
    
    if (fieldName === 'all' && JSON.stringify(state.validateResult) !== JSON.stringify(returnData)) { //validate all才触发
      this.setState({
        validateResult: returnData
      }, () => {
        props.onValidate(returnData);
      });
    }
    return returnData;
  }
  reset() {
    let newFields = {};
    Object.keys(fields).forEach((k) => {
      newFields[k] = fields[k];
      newFields[k].isValid = null;
    });
    props.onFieldsChange(newFields);
  }
  render() {
    const props = this.props;
    const state = this.state;
    const prefixCls = props.prefixCls;
    return (<div className={ `${prefixCls} ${props.className || ''}`} data-test={JSON.stringify(props.fields)}>
      {props.children}
    </div>);
  }
}
Validator.propTypes = {
  prefixCls: React.PropTypes.string,
  className: React.PropTypes.string,
  fields: React.PropTypes.object,
  onRulesChange: React.PropTypes.func
};
Validator.defaultProps = {
  prefixCls: 'ui-validator',
  className: '',
  fields: {
    name: {
      name: '',   //用于取值函数getValidValue返回值key
      value: '',
      isValid: null,  //not true or false
      allowBlank: true, //是否必填
      bindField: [],  // string or array 用于处理field间的关联验证
      rule: [], //第一个rule function 返回abort将会忽略后面的验证，在取值函数getValidValue返回值里被忽略
      message: [],
      onValidate: () => {}
    }
  },
  onFieldsChange: () => {},  //fields反射
  onValidate: () => {}  //任一field的isValid有改变就会触发
};

//默认验证规则, 局部验证，默认都是true
Validator.defaultRule = {
  money(v, params) {
    params = Object.assign({
      min: 0,
      max: Number.POSITIVE_INFINITY
    }, params || {});
    if (/^(0|[1-9]([0-9]{0,1}){1,})(\.[0-9]{1,2})?$/.test(v)) {
      if (parseFloat(v) < params.min) {
        return false;
      }
      if (parseFloat(v) > params.max) {
        return false;
      }
    } else {
      return false;
    }
  },
  /**
   * 正整数
   * @param  {[type]} v    [description]
   * @param  {[type]} params [description]
   * @return {[type]}      [description]
   */
  pi(v, params) {
    params = Object.assign({
      min: 1,
      max: Number.POSITIVE_INFINITY
    }, params || {});
    if (/^([1-9]([0-9]{0,1}){1,})?$/.test(v)) {
      if (parseFloat(v) < params.min) {
        return false;
      }
      if (parseFloat(v) > params.max) {
        return false;
      }
    } else {
      return false;
    }
  },
  /**
   * 字符长度判定，默认一个汉字对应1个英文字符
   * @param  {[type]} v    [description]
   * @param  {[type]} params [description]
   * @return {[type]}      [description]
   */
  length(v, params) {
    params = Object.assign({
      hanCharLength: 1,
      min: 1,
      max: Number.POSITIVE_INFINITY
    }, params || {});
    let num = v.replace(/[^\x00-\xff]/g,"0123456789".slice(0, params.hanCharLength)).length;
    if (num < params.min) {
      return false;
    }
    if (num > params.max) {
      return false;
    }
  }
};
Validator.getNewFields = function (value, key, fields) {
  var result = Object.assign({}, fields);
  result[key] = Object.assign({}, result[key], {
    value: value
  });
  return result;
};

export default Validator;


