/**
* @Date:   2016-06-17T14:29:19+08:00
* @Last modified time: 2016-12-05T15:27:54+08:00
*/
/**
 * Grid demo
 */
import babelPolyfill from "babel-polyfill"; // enable es6 to es5 transform
import React from "react";
import ReactDom from "react-dom";
import Grid from "../../src/component/grid/index.js";
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      sortDataIndex: ''
    }
  }
  render() {
    var columns = [
      {
        text: <div onClick={this.sortHandle.bind(this)}>表头↑↓</div>,
        dataIndex: 'a',
        colSpan: 2,
        width: 200
      }, {
        id: '123',
        text: '表头2',
        dataIndex: 'b',
        colSpan: 0,
        width: 500,
        sort: 'asc',
        renderer: function(o, row, index) {
          let obj = {
            content: o,
            props: {}
          }
          if (index === 0) {
            obj.props.rowSpan = 2;
          }
          if (index === 1) {
            obj.props.rowSpan = 0;
          }
          return obj;
        }
      }, {
        text: '表头3',
        dataIndex: 'c',
        width: 200
      }, {
        text: '操作',
        dataIndex: '',
        width: 300,
        renderer: function() {
          return <a href="#">操作</a>
        }
      }
    ];
    var data = this.state.gridData;
    return (
      <div>
        <Grid useFixedHeader={false} columns={columns} data={data} onPageChange={this.onPageChange.bind(this)}/>
        <button onClick={this.handleSearch.bind(this)}>search</button>
      </div>
    )
  }
  onPageChange(obj) {
    console.log(obj)
    this.setState({
      gridData: {
        pageSize: 10,
        currentPage: obj.currentPage,
        total: 63,
        rows: [
          {
            a: Math.random()
          }, {
            a: 'cdd',
            b: 'edd'
          }, {
            a: '1333',
            c: 'eee',
            d: 2
          }
        ]
      }
    })
  }
  sortHandle() {}
  handleSearch(sort) {
    this.setState({
      gridData: {
        pageSize: 10,
        currentPage: 1,
        total: 63,
        rows: [
          {
            a: Math.random()
          }, {
            a: 'cdd',
            b: 'edd'
          }, {
            a: '1333',
            c: 'eee',
            d: 2
          }
        ]
      }
    })
  }
}
ReactDom.render(
  <App/>, document.getElementById("container"));
