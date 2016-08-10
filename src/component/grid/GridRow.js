import React from 'react';
import {
  Widget
} from '../component.js';

class GridRow extends Widget {
  componentWillUnmount() {
    this.props.onBeforeDestroy(this.props.record);
  }

  render() {
    const props = this.props;
    const prefixCls = props.prefixCls;
    const columns = props.columns;
    const record = props.record;
    const index = props.index;
    const cells = [];

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const colCls = col.className || '';
      const renderer = col.renderer;
      let width = col.width || 'auto';
      let text = record[col.dataIndex];

      let tdProps;
      let colSpan;
      let rowSpan;
      let notRender = false;
      if (/^[0-9]*$/.test(width)) {
        width = width + 'px';
      }

      if (renderer) {
        text = renderer(text, record, index) || {};
        tdProps = text.props || {};
        if (!React.isValidElement(text) && 'content' in text) {
          text = text.content;
        }
        rowSpan = tdProps.rowSpan;
        colSpan = tdProps.colSpan;
      }
      if (rowSpan === 0 || colSpan === 0) {
        notRender = true;
      }
      if (!notRender) {
        cells.push(<td key={i} colSpan={colSpan} rowSpan={rowSpan} className={`${colCls}`} style={{
          width: width
        }}>
          {text}
        </td>);
      }
    }
    return (<tr className={`${prefixCls} ${props.className || ''}`}>{cells}</tr>);
  }
}
GridRow.propTypes = {
  onBeforeDestroy: React.PropTypes.func,
  record: React.PropTypes.object,
  prefixCls: React.PropTypes.string,
};
GridRow.defaultProps = {
  onBeforeDestroy: () => {
  }
};

export default GridRow;
