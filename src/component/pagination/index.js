import React from 'react';
import {
    Widget
} from '../component.js';
import style from './pagination.css';

class Pagination extends Widget {
    constructor(props){
        super(props);
        this.state = {
            currentInput: props.currentPage,
            currentPage: props.currentPage,
            max: Math.ceil(props.total / props.pageSize)
        };
    }
    componentWillUnmount() {
        // this.props.onBeforeDestroy(this.props.record);
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            currentInput: nextProps.currentPage,
            currentPage: nextProps.currentPage
        });
    }
    getPages(){
        let total = this.props.total,
        size = this.props.pageSize,
        currentPage = this.state.currentPage,
        span = this.props.pages,
        max = Math.ceil(total / size),
        pages = [],
        left,
        right

        if (currentPage > max) {
          currentPage = max
        }

        left = currentPage - Math.floor(span / 2) + 1
        if (left < 1) {
          left = 1
        }
        right = left + span - 2
        if (right >= max) {
          right = max
          left = right - span + 2
          if (left < 1) {
            left = 1
          }
        } else {
          right -= left > 1 ? 1 : 0
        }

        // add first
        if (left > 1) {
          pages.push(1)
          if(left !== 2) pages.push(-1)
        }
        for (let i = left; i < right + 1; i++) {
          pages.push(i)
        }
        // add last
        if (right < max) {
          if(right+1 != max) pages.push(-2)
          pages.push(max)
        }
        return {pages, max}
    }
    setCurrent(currentPage) {
        currentPage = parseInt(currentPage)
        this.setState({
            currentInput: currentPage,
            currentPage: currentPage
        })
    }
    handleChange(currentPage){
        this.setCurrent(currentPage)
        if (this.props.onPageChange) {
            this.props.onPageChange(currentPage)
        }
    }
    handleInputChange({range, value}, e) {
        function ensureRange(number, min, max) {
            return isNaN(number) || number < min ? min : number > max ? max : number; 
        }
        this.setState({currentInput: ensureRange(value===undefined ? (+e.target.value) : value, range.min, range.max)},
            ()=>{ this.refs.number && this.refs.number.select(); });
    }
    render(){
        var currentInput = this.state.currentInput;
        var currentPage = this.state.currentPage;
        var { pages, max } = this.getPages();
        var items = [];
        var self = this;
        /*
        items.push(
          <li key="previous" onClick={currentPage <= 1 ? null : this.handleChange.bind(this, currentPage - 1)} className={currentPage <= 1 ? 'disabled' : '' }>
            <a>prev</a>
          </li>
        )
        */
        items.push(
            <li className="ui-pagination-pole" key="current">第<a>{ currentPage }</a>页</li>
        );

        pages.forEach(function(page){
            if(page === -1 || page === -2){
                items.push(
                    <li className="ui-pagination-ellipsis" key={ page }><a>...</a></li>
                )
            }else{
                items.push(
                  <li onClick={ self.handleChange.bind(self, page)} className={ page === currentPage ? 'active': '' } key={page}>
                    <a>{page}</a>
                  </li>
                )
            }
        })
        items.push(
            <li className="ui-pagination-pole" key="total">&nbsp;共<a>{ max === 0 ? 1 : max }</a>页</li>
        );
        /*
        items.push(
          <li key="next" onClick={currentPage >= max ? null : this.handleChange.bind(this, currentPage + 1)} className={currentPage >= max ? ' disabled' : '' }>
            <a>next</a>
          </li>
        )*/
        const range = {min: 1, max: max === 0 ? 1 : max};
        items.push(
            <li className="ui-pagination-pole" key="input">
                &nbsp;到第&nbsp;
                <span className="ui-pagination-inputs">
                    <input type="text" ref="number" className="ui-pagination-inputs-number" min={range.min} max={range.max}
                     value={currentInput} onFocus={(e)=>{e.target.select();}}
                     onChange={ this.handleInputChange.bind(self, {range}) } />
                    <button className="ui-pagination-inputs-btn ui-pagination-inputs-up-btn"
                     onClick={ this.handleInputChange.bind(self, {range, value: currentInput+1}) }></button>
                    <button className="ui-pagination-inputs-btn ui-pagination-inputs-down-btn"
                     onClick={ this.handleInputChange.bind(self, {range, value: currentInput-1}) }></button>
                </span>
                &nbsp;页&nbsp;
                <button className="ui-pagination-submit-btn" onClick={ self.handleChange.bind(self, (currentInput>max?max:currentInput)||1)}>确定</button>
            </li>
        );
        return (
            <div className="ui-pagination">
                <ul >
                    { items }
                </ul>
                <div className="total">共<a href="javascript:;">{ this.props.total }</a>条记录</div>
            </div>
        )
    }
}

Pagination.propTypes = {
    currentPage: React.PropTypes.number, // 当前页
    total: React.PropTypes.number,   // 记录总条数
    pageSize: React.PropTypes.number,// 每页条数
    pages: React.PropTypes.number,   // 显示页码数
    onPageChange: React.PropTypes.func   // 翻页后回调
};
Pagination.defaultProps = {
    currentPage: 1,
    pageSize: 10,
    pages: 6,
    total: 0
};

export default Pagination;
