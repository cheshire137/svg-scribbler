'use strict';

var React = require('react'),
    LineItem = require('./line_item');

var LinesList = React.createClass({
  getVisibleLines: function() {
    var lines = [];
    for (var i=0; i<this.props.lines.length; i++) {
      var line = this.props.lines[i];
      if (line.points.length > 1) {
        lines.push(line);
      }
    }
    return lines;
  },
  getContainerStyle: function(visibleLines) {
    var display;
    if (visibleLines.length > 0) {
      display = 'block';
    } else {
      display = 'none';
    }
    return {display: display};
  },
  render: function() {
    var visibleLines = this.getVisibleLines();
    var self = this;
    return (
      <div style={this.getContainerStyle(visibleLines)}>
        <h4>Scribbles:</h4>
        <ul className="lines-list list-unstyled">
          {
            visibleLines.map(function(line) {
              return (
                <LineItem key={line.id} line={line} onDeleteLine={self.props.onDeleteLine} updateLine={self.props.updateLine} loadLine={self.props.loadLine} />
              );
            })
          }
        </ul>
      </div>
    );
  }
});

module.exports = LinesList;
