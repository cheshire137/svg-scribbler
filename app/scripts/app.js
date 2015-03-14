/** @jsx React.DOM */

var React = window.React = require('react'),
    mountNode = document.getElementById('app');

var SvgScribblerApp = React.createClass({
  getInitialState: function() {
    return {
      points: [],
      stroke: 'rgb(255,0,0)',
      fill: 'rgb(255,255,255)',
      strokeWidth: 3,
      isDrawing: false
    };
  },
  componentDidMount: function() {
    var self = this;
    $('.color-picker').spectrum({
      color: this.state.stroke,
      change: function(color) {
        self.setState({stroke: color.toRgbString()});
      }
    });
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
      this.addPoint({x: x, y: y});
    }
  },
  doesPointExist: function(coords) {
    for (var i=0; i<this.state.points.length; i++) {
      var point = this.state.points[i];
      if (point.left === coords.x && point.top === coords.y) {
        return true;
      }
    }
    return false;
  },
  addPoint: function(coords) {
    var newPoints = this.state.points;
    if (!this.doesPointExist(coords)) {
      var newPoint = {left: coords.x, top: coords.y, width: 10, height: 10};
      newPoints = newPoints.concat([newPoint]);
    }
    this.setState({points: newPoints});
  },
  getCanvasCoords: function(e) {
    var canvas = $(e.target);
    var offset = canvas.offset();
    var left = offset.left;
    var top = offset.top;
    var x = e.pageX - left;
    var y = e.pageY - top;
    return {x: x, y: y};
  },
  onMouseDown: function(e) {
    this.setState({isDrawing: true});
    var coords = this.getCanvasCoords(e);
    this.addPoint(coords);
  },
  onMouseMove: function(e) {
    if (!this.state.isDrawing) {
      return;
    }
    var coords = this.getCanvasCoords(e);
    this.addPoint(coords);
  },
  onMouseUp: function(e) {
    this.setState({isDrawing: false});
    var coords = this.getCanvasCoords(e);
    this.addPoint(coords);
  },
  onMouseLeave: function(e) {
    this.setState({isDrawing: false});
  },
  getPointsList: function() {
    var pairs = [];
    for (var i=0; i<this.state.points.length; i++) {
      var point = this.state.points[i];
      pairs.push(point.left + ',' + point.top);
    }
    return pairs.join(' ');
  },
  shapeStyle: function() {
    return {
      stroke: this.state.stroke,
      fill: this.state.fill,
      strokeWidth: 3
    };
  },
  chooseColorStyle: function() {
    return {
      backgroundColor: this.state.stroke,
      color: this.state.fill
    };
  },
  render: function() {
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <p>
              <input type="text" className="color-picker" />
            </p>
            <div className="svg-container clearfix">
              <svg className="svg-result">
                <polyline points={this.getPointsList()} style={this.shapeStyle()} />
              </svg>
              <canvas className="svg-canvas" onMouseDown={this.onMouseDown} onMouseMove={this.onMouseMove} onMouseUp={this.onMouseUp} onMouseLeave={this.onMouseLeave}></canvas>
            </div>
          </div>
          <div className="col-md-6">
            <pre>&lt;svg&gt;<br />
  &lt;polyline points="{this.getPointsList()}" style="stroke: {this.state.stroke}; fill: {this.state.fill}; stroke-width: {this.state.strokeWidth};" /&gt;<br />
&lt;/svg&gt;</pre>
          </div>
        </div>
      </div>
    );
  }
});

React.render(<SvgScribblerApp />, mountNode);
