'use strict';

var React = require('react'),
    LineItem = require('./line_item');

var LinesList = React.createClass({
  render: function() {
    var self = this;
    return (
      <ul className="collapsible collapsible-accordion">
        <li className="bold">
          <a className="collapsible-header active waves-effect waves-teal">
            Scribbles
          </a>
          <div className="collapsible-body">
            <ul>
              {
                this.props.lines.map(function(line) {
                  return (
                    <LineItem key={line.id} line={line} loadLine={self.props.loadLine} currentLineID={self.props.currentLineID} />
                  );
                })
              }
            </ul>
          </div>
        </li>
      </ul>
    );
  }
});

module.exports = LinesList;
