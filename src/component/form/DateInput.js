/**
 * input[type="date"]
 * @require jQuery
 */

import {
    Widget
} from "../component.js";
import moment from 'moment';
import React from 'react';
import ReactDom from 'react-dom';
import style from './form.css';
import Calendar from '../calendar/index.js';

let cptId = 0;
class DateInput extends Widget {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.cptId = cptId++;
    }
    componentWillMount() {
        this.calendarContainer = document.createElement("div");
        document.body.appendChild(this.calendarContainer);
    }
    componentDidMount() {
        this.renderCalendar({
            visible: false
        });
        $(document).on('mousedown.DateInput' + this.cptId, () => {
            this.renderCalendar({
                visible: false
            });
        }).on('mousedown.DateInput' + this.cptId, `.${this.props.prefixCls}-` + this.cptId, (evt) => {
            evt.stopPropagation();
        }).on('mousedown.DateInput' + this.cptId, `.${this.props.prefixCls}-calendar-` + this.cptId, (evt) => {
            evt.stopPropagation();
        });
    }
    componentWillUnmount() {
        ReactDom.unmountComponentAtNode(this.calendarContainer);
        document.body.removeChild(this.calendarContainer);
        $(document).off('mousedown.DateInput' + this.cptId);
        this.calendarContainer = null;
        this.cptId = null;
    }
    handleClick() {
        this.renderCalendar({
            visible: true
        });
    }
    renderCalendar(data) {
        var props = this.props,
            state = this.state,
            prefixCls = props.prefixCls;
        var visible = data.visible;
        var inputEl,
            calendarEl,
            winEl,
            inputOffset,
            inputHeight,
            inputWidth,
            calendarHeight,
            calendarWidth,
            winWidth,
            winHeight,
            winScrollTop,
            winScrollLeft,
            top = 0,
            left = 0;
        if (visible) {
            inputEl = $(ReactDom.findDOMNode(this.refs.input));
            calendarEl = $(`.${prefixCls}-calendar`, this.calendarContainer);
            winEl = $(window);
            inputOffset = inputEl.offset();
            inputHeight = inputEl.outerHeight();
            inputWidth = inputEl.outerWidth();
            calendarHeight = calendarEl.outerHeight();
            calendarWidth = calendarEl.outerWidth();
            winWidth = winEl.width();
            winHeight = winEl.height();
            winScrollTop = winEl.scrollTop();
            winScrollLeft = winEl.scrollLeft();
            if (inputOffset.top - winScrollTop >= calendarHeight) {
                if (winHeight - (inputOffset.top - winScrollTop) - inputHeight >= calendarHeight) {   //下面放得下优先放下面
                    top = inputOffset.top + inputHeight - 1;
                } else {
                    top = inputOffset.top - calendarHeight + 1;
                }
            } else {    //上面放不下直接放下面
                top = inputOffset.top + inputHeight - 1;
            }
            if (inputOffset.left - winScrollLeft + inputWidth >= calendarWidth) {
                if (winWidth - (inputOffset.left - winScrollLeft) >= calendarWidth) {   //左面放得下优先放右面
                    left = inputOffset.left;
                } else {
                    left = inputOffset.left + inputWidth - calendarWidth;
                }
            } else {    //左面放不下直接放右面
                left = inputOffset.left;
            }
        }
        ReactDom.render(<div style={{
            "zIndex": 10000,
            "display": visible ? "block" : "none",
            "position": "absolute",
            "top": top + "px",
            "left": left + "px"
        }}>
            <Calendar {...props.calendarProps} className={`${prefixCls}-calendar ${prefixCls}-calendar-` + this.cptId} initialDate={props.value ? moment(props.value, "YYYY-MM-DD")._d : new Date()} onClickDate={
                (date) => {
                    this.renderCalendar({
                        visible: false
                    });
                    props.onChange.call(this, {
                        target: {
                            value: date
                        }
                    });
                }
            } />
        </div>, this.calendarContainer);
    }
    render() {
        var props = this.props,
            prefixCls = props.prefixCls;
        return (<input {...props} className={`${prefixCls}` + ` ${prefixCls}-` + this.cptId + ' ' + (props.className || '')} type="text" ref="input" value={props.value} readOnly={true} onClick={this.handleClick.bind(this)} />);
    }
}
export default DateInput;
DateInput.defaultProps = {
    calendarProps: null,
    onChange: () => {},
    prefixCls: "ui-form-dateinput"
};
