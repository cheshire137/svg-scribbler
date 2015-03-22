'use strict';

var React = require('react'),
    LineItem = require('./line_item');

var LinesList = React.createClass({
  render: function() {
    var self = this;
    return (
      <ul className="side-nav fixed lines-list hide-on-med-and-down">
        <li className="logo collection-header">
          Scribbles
        </li>
        {
          this.props.lines.map(function(line) {
            return (
              <LineItem key={line.id} line={line} loadLine={self.props.loadLine} currentLineID={self.props.currentLineID} />
            );
          })
        }
      </ul>
    );
  }
});

module.exports = LinesList;
