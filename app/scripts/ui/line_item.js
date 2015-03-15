'use strict';

var React = require('react');

var LineItem = React.createClass({
  componentDidMount: function() {
    var popoverSelector = '[data-toggle="popover"]';
    $('body').popover({
      selector: popoverSelector,
      trigger: 'click',
      placement: 'left',
      html: true,
      content: function() {
        var link = $(this);
        return link.next('.line-settings').html();
      }
    }).on('show.bs.popover', function(e) {
      $(popoverSelector).not(e.target).popover('destroy');
      $('.popover').remove();
    });
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
  render: function() {
    return (
      <li className="line-item">
        <a data-toggle="popover" data-trigger="click" title={this.getLineTitle()}>
          <span className="line-representation" style={this.getLineStyle()}></span>
        </a>
        <div className="line-settings">
          Fill:
          <span className="color-square" style={this.getFillSquareStyle()}></span>
          {this.props.line.fill}<br />
          Border color:
          <span className="color-square" style={this.getStrokeSquareStyle()}></span>
          {this.props.line.stroke}<br />
          Border width: {this.props.line.strokeWidth}<br />
          <a className="delete-line" onClick={this.deleteLine}>
            Delete
          </a>
        </div>
      </li>
    );
  }
});

module.exports = LineItem;
