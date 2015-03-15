'use strict';

var React = require('react');

var LineItem = React.createClass({
  componentDidMount: function() {
    $('[data-toggle="tooltip"]').tooltip();
  },
  getScaledStrokeWidth: function(x) {
    if (x === 0) {
      return x;
    }
    var maxDisplayWidth = 7;
    var maxAllowedWidth = 20;
    return Math.ceil((maxDisplayWidth * x) / maxAllowedWidth);
  },
  getLineStyle: function() {
    var line = this.props.line;
    return {
      borderColor: line.stroke,
      backgroundColor: line.fill,
      borderWidth: this.getScaledStrokeWidth(line.strokeWidth)
    };
  },
  getLineTitle: function() {
    return 'Scribble #' + this.props.line.id;
  },
  getFillSquareStyle: function() {
    return {backgroundColor: this.props.line.fill};
  },
  getStrokeSquareStyle: function() {
    return {backgroundColor: this.props.line.stroke};
  },
  deleteLine: function() {
    this.props.onDeleteLine(this.props.line);
  },
  loadLine: function() {
    this.props.loadLine(this.props.line);
  },
  render: function() {
    return (
      <li className="line-item">
        <a onClick={this.loadLine} data-toggle="tooltip" title={this.getLineTitle()}>
          <span className="line-representation" style={this.getLineStyle()}></span>
        </a>
      </li>
    );
  }
});

module.exports = LineItem;
