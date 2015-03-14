/** @jsx React.DOM */

var React = window.React = require('react'),
    mountNode = document.getElementById('app');

var SvgScribblerApp = React.createClass({
  getInitialState: function() {
    return {
      lines: [{
        points: [],
        stroke: '#8e179e',
        fill: 'transparent',
        strokeWidth: 3
      }],
      isDrawing: false
    };
  },
  componentDidMount: function() {
    var self = this;
    $('#stroke-color-picker').spectrum({
      color: this.state.lines[0].stroke,
      change: function(color) {
        var line = self.getCurrentLine();
        line.stroke = color.toRgbString();
        self.updateCurrentLine(line);
      }
    });
    $('#fill-color-picker').spectrum({
      color: this.state.lines[0].fill,
      change: function(color) {
        var line = self.getCurrentLine();
        line.fill = color.toRgbString();
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
        stroke: lastLine.stroke,
        fill: lastLine.fill,
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
      if (line.points.length < 2) {
        continue;
      }
      var svgPoints = [];
      for (var j=0; j<line.points.length; j++) {
        var point = line.points[j];
        svgPoints.push(point.left + ',' + point.top);
      }
      svgPoints = svgPoints.join(' ');
      var svgStyle = 'stroke: ' + line.stroke + '; fill: ' + line.fill +
                     '; stroke-width: ' + line.strokeWidth;
      polylines.push('  <polyline points="' + svgPoints + '" style="' +
                     svgStyle + '" />');
    }
    return polylines.join("\n") + "\n";
  },
  downloadSvg: function(e) {
    var button = $(e.target);
    var svgEl = $('svg.svg-result');
    var svgSource = $(svgEl.wrap('<div>').parent().html());
    svgSource.find('*').removeAttr('data-reactid');
    svgSource = svgSource.html();
    svgSource = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
                "\n" + svgSource + "\n</svg>";
    svgEl.unwrap('<div>');
    console.log(svgSource);
    var b64 = Base64.encode(svgSource);
    var fileName = 'svg-scribbler-' + moment().format('YYYY-MM-DD-hh-mm-ss-a') +
                   '.svg';
    var link = $('<a>').attr('href-lang', 'image/svg+xml').
                        attr('href', "data:image/svg+xml;base64,\n" + b64).
                        attr('download', fileName).text(' ');
    $('body').append(link);
    link[0].click();
    link.remove();
    button.blur();
  },
  downloadButtonStyle: function() {
    var display;
    if (this.state.lines.length > 1) {
      display = 'inline-block';
    } else {
      var line = this.getCurrentLine();
      display = line.points.length > 0 ? 'inline-block' : 'none';
    }
    return {display: display};
  },
  render: function() {
    var self = this;
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <div className="color-controls">
              <div className="row">
                <div className="col-sm-6">
                  <label htmlFor="stroke-color-picker">Border:</label>
                  <input type="text" id="stroke-color-picker" className="color-picker" />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="fill-color-picker">Fill:</label>
                  <input type="text" id="fill-color-picker" className="color-picker" />
                </div>
              </div>
            </div>
            <div className="svg-container clearfix">
              <svg className="svg-result" version="1.1" xmlns="http://www.w3.org/2000/svg">
                {
                  this.state.lines.map(function(line) {
                    if (line.points.length > 1) {
                      return <polyline points={self.getPointsList(line)} style={self.getPolylineStyle(line)} />
                    }
                  })
                }
              </svg>
              <canvas className="svg-canvas" onMouseDown={this.onMouseDown} onMouseMove={this.onMouseMove} onMouseUp={this.onMouseUp} onMouseLeave={this.onMouseLeave}></canvas>
            </div>
          </div>
          <div className="col-md-6">
            <p>
              <button type="button" className="btn btn-info download-button" onClick={this.downloadSvg} style={this.downloadButtonStyle()}>
                <i className="fa fa-download"></i>
                Download SVG
              </button>
            </p>
            <pre>&lt;svg version="1.1" xmlns="http://www.w3.org/2000/svg"&gt;<br />
  {this.getPolylineSource()}
&lt;/svg&gt;</pre>
          </div>
        </div>
      </div>
    );
  }
});

React.render(<SvgScribblerApp />, mountNode);
