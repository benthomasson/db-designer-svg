import React, { Component } from 'react';

import Colors from '../style/Colors'

class Relation extends Component {

  relation_x(from_column, to_column) {
    if (to_column === null) {
        return from_column.table.x + from_column.table.width/2;
    }
    if (to_column.abs_x() + to_column.table.width < from_column.abs_x()) {
        return from_column.table.x;
    }
    if (to_column.abs_x() + to_column.table.width > from_column.abs_x() + from_column.table.width) {
        return from_column.table.x + from_column.table.width;
    }
    return from_column.table.x + from_column.table.width/2;
  }

  mid_y(column) {
    return column.table.y + column.y + column.height / 2;
  }

  slope() {
    //Return the slope in degrees for this transition.
    var x1 = this.props.from_column.relation_x(this.props.to_column);
    var y1 = this.props.from_column.mid_y();
    var x2 = this.props.to_column.relation_x(this.props.from_column);
    var y2 = this.props.to_column.mid_y();
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 180;
  }

  render() {

    var relationSelectedStyle = {
      stroke: Colors['selectedBlue'],
      strokeWidth: 6
    };

    var relationStyle = {
      stroke: Colors['darkWidgetDetail'],
    };

    var arrowSelectedStyle = {
      fill: Colors['selectedBlue'],
      stroke: Colors['selectedBlue']
    };

    var arrowStyle = {
      stroke: Colors['darkWidgetDetail'],
      fill: Colors['darkWidgetDetail']
    };
    return (
      <g>
        {this.props.selected ?
        <line x1={this.relation_x(this.props.from_column, this.props.to_column)}
            y1={this.mid_y(this.props.from_column)}
            x2={this.props.to_column !== null ? this.relation_x(this.props.to_column, this.props.from_column) : this.props.scaledX}
            y2={this.props.to_column !== null ? this.mid_y(this.props.to_column) : this.props.scaledY}
            style={relationSelectedStyle} />
        : null}
        <line x1={this.relation_x(this.props.from_column, this.props.to_column)}
            y1={this.mid_y(this.props.from_column)}
            x2={this.props.to_column !== null ? this.relation_x(this.props.to_column, this.props.from_column) : this.props.scaledX}
            y2={this.props.to_column !== null ? this.mid_y(this.props.to_column) : this.props.scaledY}
            style={relationStyle} />
        {(this.props.to_column !== this.props.from_column && this.props.to_column !== null) ?
          <g transform={"translate(" + this.relation_x(this.props.to_column, this.props.from_column) + "," + this.mid_y(this.props.to_column) + ")" +
                        "rotate(" + this.slope() + ")" +
                        "rotate(180)"}>
            <g transform="translate(-19, -9)">
            {this.props.selected ?
              <path transform="translate(-2, -3)" d="M0,0 L0,24 L24,12 z" style={arrowSelectedStyle} />
            : null}
            <path d="M0,0 L0,18 L18,9 z" style={arrowStyle} />
            </g>
          </g>
        : null}
      </g>
    );
  }
}

export default Relation;
