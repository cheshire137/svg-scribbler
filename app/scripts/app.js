/** @jsx React.DOM */

var React = window.React = require('react'),
    mountNode = document.getElementById('app');

var SvgScribblerApp = React.createClass({
  getInitialState: function() {
    return {
      lines: [{
        points: [],
        stroke: '#ff0000',
        fill: '#ffffff',
        strokeWidth: 3
      }],
      isDrawing: false
    };
  },
  componentDidMount: function() {
    var self = this;
    $('.color-picker').spectrum({
      color: this.state.lines[0].stroke,
      change: function(color) {
        var line = self.getCurrentLine();
        line.stroke = color.toRgbString();
        self.updateCurrentLine(line);
      }
    });
  },
  doesPointExist: function(line, coords) {
    for (var i=0; i<line.length; i++) {
      var point = line[i];
      if (point.left === coords.x && point.top === coords.y) {
        return true;
      }
    }
    return false;
  },
  getCurrentLine: function() {
    var line = this.state.lines.slice(this.state.lines.length - 1)[0];
    var newLine = {};
    var props = Object.keys(line);
    for (var i=0; i<props.length; i++) {
      var prop = props[i];
      var originalValue = line[prop];
      if (Array.isArray(originalValue)) {
        newLine[prop] = originalValue.slice(0, originalValue.length);
      } else {
        newLine[prop] = originalValue;
      }
    }
    return newLine;
  },
  updateCurrentLine: function(line) {
    var newLines = this.state.lines.slice(0, this.state.lines.length - 1);
    newLines.push(line);
    this.setState({lines: newLines});
  },
  addPoint: function(coords) {
    var line = this.getCurrentLine();
    if (!this.doesPointExist(line, coords)) {
      var newPoint = {left: coords.x, top: coords.y, width: 10, height: 10};
      line.points.push(newPoint);
      this.updateCurrentLine(line);
    }
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
  addNewLineIfNecessary: function() {
    var lastLine = this.getCurrentLine();
    if (lastLine.points.length > 0) {
      var newLine = {
        points: [],
        stroke: '#ff0000',
        fill: '#ffffff',
        strokeWidth: 3
      };
      this.setState({lines: this.state.lines.concat(newLine)});
    }
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
    var coords = this.getCanvasCoords(e);
    this.addPoint(coords);
    this.setState({isDrawing: false});
    this.addNewLineIfNecessary();
  },
  onMouseLeave: function(e) {
    this.setState({isDrawing: false});
    this.addNewLineIfNecessary();
  },
  getPointsList: function(line) {
    var pairs = [];
    for (var i=0; i<line.points.length; i++) {
      var point = line.points[i];
      pairs.push(point.left + ',' + point.top);
    }
    return pairs.join(' ');
  },
  getPolylineStyle: function(line) {
    return {
      stroke: line.stroke,
      fill: line.fill,
      strokeWidth: line.strokeWidth
    };
  },
  getPolylineSource: function() {
    var polylines = [];
    for (var i=0; i<this.state.lines.length; i++) {
      var line = this.state.lines[i];
      if (line.points.length < 1) {
        continue;
      }
      var svgPoints = [];
      for (var j=0; j<line.points.length; j++) {
        var point = line.points[j];
        svgPoints.push(point.left + ',' + point.top);
      }
      svgPoints = svgPoints.join(' ');
      polylines.push('  <polyline points="' + svgPoints + '" />');
    }
    return polylines.join("\n") + "\n";
  },
  render: function() {
    var self = this;
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <p>
              <input type="text" className="color-picker" />
            </p>
            <div className="svg-container clearfix">
              <svg className="svg-result">
                {
                  this.state.lines.map(function(line) {
                    return <polyline points={self.getPointsList(line)} style={self.getPolylineStyle(line)} />
                  })
                }
              </svg>
              <canvas className="svg-canvas" onMouseDown={this.onMouseDown} onMouseMove={this.onMouseMove} onMouseUp={this.onMouseUp} onMouseLeave={this.onMouseLeave}></canvas>
            </div>
          </div>
          <div className="col-md-6">
            <pre>&lt;svg&gt;<br />
  {this.getPolylineSource()}
&lt;/svg&gt;</pre>
          </div>
        </div>
      </div>
    );
  }
});

React.render(<SvgScribblerApp />, mountNode);
