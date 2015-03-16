'use strict';

var React = require('react'),
    LineItem = require('./line_item');

var LinesList = React.createClass({
  render: function() {
    var self = this;
    return (
      <div>
        <h4>Scribbles:</h4>
        <ul className="lines-list list-unstyled">
          {
            this.props.lines.map(function(line) {
              return (
                <LineItem key={line.id} line={line} loadLine={self.props.loadLine} currentLineID={self.props.currentLineID} />
              );
            })
          }
        </ul>
      </div>
    );
  }
});

module.exports = LinesList;
