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
  loadLine: function() {
    this.props.loadLine(this.props.line);
  },
  isCurrentLine: function() {
    return this.props.currentLineID === this.props.line.id;
  },
  getLineClass: function() {
    var cssClass = 'bold line-item';
    if (this.props.line.points.length < 2) {
      cssClass += ' next-line';
    }
    if (this.isCurrentLine()) {
      cssClass += ' active';
    } else {
      cssClass += ' not-current-line';
    }
    return cssClass;
  },
  getLinkClass: function() {
    var cssClass = 'tooltipped';
    if (this.isCurrentLine()) {
      cssClass += ' active';
    }
    return cssClass;
  },
  render: function() {
    return (
      <li className={this.getLineClass()}>
        <a onClick={this.loadLine} className={this.getLinkClass()} data-delay="20" data-position="right" data-tooltip={this.getLineTitle()}>
          <span className="line-representation" style={this.getLineStyle()}></span>
        </a>
      </li>
    );
  }
});

module.exports = LineItem;
