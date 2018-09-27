import React, { Component } from 'react';

import Colors from '../style/Colors'

class Template extends Component {
  render() {

    var columns = [];

    var tableTextStyle = {
      fill: Colors['buttonText'],
      fontSize: "14px"
    };

    var tableTextSelectedStyle = {
      fontSize: "14px"
    };

    var tableTitleStyle = {
      fill: Colors['widgetBody'],
      strokeWidth: 1,
      stroke: Colors['darkWidgetDetail']
    };

    var tableTitleSelectedStyle = {
      fill: Colors['selectedBlue'],
      strokeWidth: 1,
      stroke: Colors['selectedBlue']
    };
    var tableColumnStyle = {
      fill: Colors['lightWidgetDetail'],
      strokeWidth: 1,
      stroke: Colors['darkWidgetDetail']
    };

    for(var i=0; i < this.props.columns.length; i++) {
      var column = this.props.columns[i];
      columns.push(<g>
                     <rect x={column.x}
                           y={column.y}
                           width={this.props.width}
                           height={column.height}
                           style={tableColumnStyle}>
                     </rect>
                     <text style={tableTextStyle} textAnchor="left" dy=".2em" x={10} y={column.y + column.height/2}>{column.name}{column.edit_label?'_':''}</text>
                   </g>);
    }
    return (
      <g transform={"translate(" + this.props.x + "," + this.props.y +")"}>
        {this.props.selected ?
        <rect
            x="-2"
            y="-2"
            width={this.props.width + 4}
            height={this.props.full_height + 4}
            style={tableTitleSelectedStyle}>
        </rect>
        : null}
        <rect
            x="0"
            y="0"
            width={this.props.width}
            height={this.props.height}
            style={tableTitleStyle}>
        </rect>
        {this.props.selected ?
        <text style={tableTextSelectedStyle}
              filter="url(#selected)"
              textAnchor="left"
              x={10}
              y={this.props.height/2}
              dy=".2em"> {this.props.name} </text>
        : null}
        <text style={tableTextStyle} textAnchor="left" dy=".2em" x={10} y={this.props.height/2}>{this.props.name}{this.props.edit_label?'_':''}</text>
        {columns}
      </g>
    );
  }
}

export default Template;
