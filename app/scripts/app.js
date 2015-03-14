/** @jsx React.DOM */

var React = window.React = require('react'),
    mountNode = document.getElementById('app');

var SvgScribblerApp = React.createClass({
  getInitialState: function() {
    return {
      points: [],
      shapeStyle: {
        stroke: 'rgb(255,0,0)',
        fill: 'rgb(255,255,255)',
        strokeWidth: 3
      }
    };
  },
  onAddPoint: function(e) {
    var canvas = $(e.target);
    var offset = canvas.offset();
    var left = offset.left;
    var top = offset.top;
    var x = e.pageX - left;
    var y = e.pageY - top;
    var clickedExistingPoint = false;
    var points = this.state.points;
    for (var i=0; i<this.state.points.length; i++) {
      var point = this.state.points[i];
      if (y > point.top && y < point.top + point.height &&
          x > point.left && x < point.left + point.width) {
        alert('clicked a point', point);
        clickedExistingPoint = true;
      }
    }
    if (!clickedExistingPoint) {
      var newPoint = {left: x, top: y, width: 10, height: 10};
      this.setState({points: this.state.points.concat([newPoint])});
    }
  },
  getPointsList: function() {
    var pairs = [];
    for (var i=0; i<this.state.points.length; i++) {
      var point = this.state.points[i];
      pairs.push(point.left + ',' + point.top);
    }
    return pairs.join(' ');
  },
  render: function() {
    return (
      <div>
        <div className="svg-container clearfix">
          <svg className="svg-result">
            <polyline points={this.getPointsList()} style={this.state.shapeStyle} />
          </svg>
          <canvas className="svg-canvas" onClick={this.onAddPoint}></canvas>
        </div>
        <p>points:</p>
        <ul>
        {
          this.state.points.map(function(point) {
            return <li>{point.left}, {point.top}</li>
          })
        }
        </ul>
      </div>
    );
  }
});

React.render(<SvgScribblerApp />, mountNode);
