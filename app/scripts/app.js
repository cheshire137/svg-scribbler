/** @jsx React.DOM */

var React = window.React = require('react'),
    LinesList = require('./ui/lines_list'),
    mountNode = document.getElementById('app');

var SvgScribblerApp = React.createClass({
  getInitialState: function() {
    var colors = randomColor({count: 2});
    var minStrokeWidth = 0;
    var maxStrokeWidth = 20;
    return {
      minStrokeWidth: minStrokeWidth,
      maxStrokeWidth: maxStrokeWidth,
      lines: [{
        points: [],
        stroke: colors[0],
        fill: colors[1],
        strokeWidth: this.getRandomStrokeWidth(minStrokeWidth, maxStrokeWidth),
        id: 1
      }],
      isDrawing: false,
      currentLineID: 1
    };
  },
  getRandomStrokeWidth: function(min, max) {
    if (typeof min === 'undefined') {
      min = this.state.minStrokeWidth;
    }
    if (typeof max === 'undefined') {
      max = this.state.maxStrokeWidth;
    }
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
  adjustSvgSize: function() {
    var svgWrapper = $('.svg-container');
    var footer = $('.footer');
    var height = $(window).height();
    height = height - svgWrapper.offset().top - footer.height();
    svgWrapper.css('height', height);
  },
  onResize: function() {
    this.adjustSvgSize();
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
    this.adjustSvgSize();
    $('[data-toggle="tooltip"]').tooltip();
    window.addEventListener('resize', this.onResize);
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.onResize);
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
  getCurrentLineIndex: function() {
    for (var i=0; i<this.state.lines.length; i++) {
      var line = this.state.lines[i];
      if (line.id === this.state.currentLineID) {
        return i;
      }
    }
    console.error('could not find current line with ID',
                  this.state.currentLineID);
    return undefined;
  },
  copyLine: function(line) {
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
  getCurrentLine: function() {
    var index = this.getCurrentLineIndex();
    if (typeof index === 'undefined') {
      return;
    }
    var line = this.state.lines[index];
    return this.copyLine(line);
  },
  updateCurrentLine: function(replacementLine) {
    var index = this.getCurrentLineIndex();
    if (typeof index === 'undefined') {
      return;
    }
    var newLines = this.state.lines.slice(0, index).
                        concat([replacementLine]).
                        concat(this.state.lines.slice(index + 1));
    this.setState({lines: newLines});
  },
  updateLine: function(replacementLine) {
    var index;
    for (var i=0; i<this.state.lines.length; i++) {
      var line = this.state.lines[i];
      if (line.id === replacementLine.id) {
        index = i;
        break;
      }
    }
    if (typeof index !== 'undefined') {
      var newLines = this.state.lines.slice(0, index).
                          concat([replacementLine]).
                          concat(this.state.lines.slice(index + 1));
      this.setState({lines: newLines});
    }
  },
  addPoint: function(coords) {
    var line = this.getLastLine();
    if (!this.doesPointExist(line, coords)) {
      var newPoint = {left: coords.x, top: coords.y, width: 10, height: 10};
      line.points.push(newPoint);
      this.updateLine(line);
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
  getNextLineID: function() {
    var maxID = this.state.lines[0].id;
    for (var i=0; i<this.state.lines.length; i++) {
      var line = this.state.lines[i];
      if (line.id > maxID) {
        maxID = line.id;
      }
    }
    return maxID + 1;
  },
  addNewLine: function() {
    var lastLine = this.getLastLine();
    var newLine = {
      points: [],
      stroke: lastLine.stroke,
      fill: lastLine.fill,
      strokeWidth: lastLine.strokeWidth,
      id: this.getNextLineID()
    };
    var newLines = this.state.lines.concat([newLine]);
    this.setState({lines: newLines, currentLineID: newLine.id});
  },
  addNewLineIfNecessary: function() {
    if (this.getLastLine().points.length > 1) {
      this.addNewLine();
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
  getLastLine: function() {
    return this.copyLine(this.state.lines[this.state.lines.length - 1]);
  },
  getLastLineWithoutPoints: function() {
    for (var i=this.state.lines.length - 1; i>=0; i--) {
      var line = this.state.lines[i];
      if (line.points.length < 2) {
        return this.copyLine(line);
      }
    }
    return null;
  },
  randomizeStroke: function() {
    var color = randomColor();
    $('#stroke-color-picker').spectrum('set', color);
    var line = this.getCurrentLine();
    if (line) {
      line.stroke = color;
      this.updateLine(line);
    }
  },
  randomizeFill: function() {
    var color = randomColor();
    $('#fill-color-picker').spectrum('set', color);
    var line = this.getCurrentLine();
    if (line) {
      line.fill = color;
      this.updateLine(line);
    }
  },
  clearStroke: function() {
    var color = 'transparent';
    $('#stroke-color-picker').spectrum('set', color);
    var line = this.getCurrentLine();
    if (line) {
      line.stroke = color;
      this.updateLine(line);
    }
  },
  clearFill: function() {
    var color = 'transparent';
    $('#fill-color-picker').spectrum('fill', color);
    var line = this.getCurrentLine();
    if (line) {
      line.fill = color;
      this.updateLine(line);
    }
  },
  randomizeStrokeWidth: function() {
    var strokeWidth = this.getRandomStrokeWidth();
    var line = this.getCurrentLine();
    if (line) {
      line.strokeWidth = strokeWidth;
      this.updateLine(line);
    }
  },
  setStrokeWidth: function(e) {
    var slider = $(e.target);
    var line = this.getCurrentLine();
    line.strokeWidth = slider.val();
    this.updateCurrentLine(line);
  },
  deleteLine: function(lineToDelete) {
    var index;
    for (var i=0; i<this.state.lines.length; i++) {
      var line = this.state.lines[i];
      if (line.id === lineToDelete.id) {
        index = i;
        break;
      }
    }
    if (typeof index !== 'undefined') {
      var line = this.getLastLineWithoutPoints();
      var newLines = this.state.lines.slice(0, index).
                          concat(this.state.lines.slice(index + 1));
      this.loadLine(line);
      this.setState({lines: newLines});
    }
  },
  deleteCurrentLine: function() {
    this.deleteLine({id: this.state.currentLineID});
  },
  loadLine: function(line) {
    this.setState({currentLineID: line.id});
    $('#fill-color-picker').spectrum('set', line.fill);
    $('#stroke-color-picker').spectrum('set', line.stroke);
  },
  getCurrentLineStrokeWidth: function() {
    return this.getCurrentLine().strokeWidth;
  },
  getDeleteLineStyle: function() {
    var line = this.getCurrentLine();
    var display;
    if (line.points.length < 2 || this.state.lines.length === 1) {
      display = 'none';
    } else {
      display = 'inline-block';
    }
    return {display: display};
  },
  render: function() {
    var self = this;
    return (
      <div>
        <div className="page-header clearfix">
          <button type="button" className="pull-right btn btn-info download-button" onClick={this.downloadSvg} style={this.downloadButtonStyle()}>
            <i className="fa fa-download"></i>
            Download SVG
          </button>
          <h1>SVG Scribbler</h1>
        </div>
        <div role="tabpanel">
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className="active">
              <a href="#canvas-tab" aria-controls="canvas-tab" role="tab" data-toggle="tab">
                Draw
              </a>
            </li>
            <li role="presentation">
              <a href="#source-tab" aria-controls="source-tab" role="tab" data-toggle="tab">
                View SVG Source
              </a>
            </li>
          </ul>
          <div className="tab-content">
            <div role="tabpanel" className="tab-pane fade in active" id="canvas-tab">
              <div className="row">
                <div className="col-sm-9 col-md-10">
                  <div className="color-controls">
                    <div className="form-inline">
                      <div className="form-group">
                        <strong>
                          Scribble #{this.state.currentLineID}
                        </strong>
                        <a className="delete-line" title="Delete" data-toggle="tooltip" onClick={this.deleteCurrentLine} style={this.getDeleteLineStyle()}>
                          <i className="fa fa-remove"></i>
                        </a>
                      </div>
                      <div className="form-group">
                        <label htmlFor="stroke-color-picker">Border:</label>
                        <input type="text" id="stroke-color-picker" className="color-picker" />
                        <button type="button" className="randomize-color btn btn-flat btn-sm" data-toggle="tooltip" title="Randomize" onClick={this.randomizeStroke}>
                          <i className="fa fa-random"></i>
                        </button>
                        <button type="button" className="clear-color btn btn-flat btn-sm" data-toggle="tooltip" title="Clear" onClick={this.clearStroke}>
                          <i className="fa fa-remove"></i>
                        </button>
                      </div>
                      <div className="form-group">
                        <label htmlFor="fill-color-picker">Fill:</label>
                        <input type="text" id="fill-color-picker" className="color-picker" />
                        <button type="button" className="randomize-color btn btn-flat btn-sm" data-toggle="tooltip" title="Randomize" onClick={this.randomizeFill}>
                          <i className="fa fa-random"></i>
                        </button>
                        <button type="button" className="clear-color btn btn-flat btn-sm" data-toggle="tooltip" title="Clear" onClick={this.clearFill}>
                          <i className="fa fa-remove"></i>
                        </button>
                      </div>
                      <div className="form-group">
                        <label htmlFor="stroke-width-slider">Border width:</label>
                        <span className="range-input-wrapper">
                          <span className="help-inline">
                            {this.state.minStrokeWidth}
                          </span>
                          <input onInput={this.setStrokeWidth} type="range" id="stroke-width-slider" min={this.state.minStrokeWidth} value={this.getCurrentLineStrokeWidth()} step="1" max={this.state.maxStrokeWidth} />
                          <span className="help-inline">
                            {this.state.maxStrokeWidth}
                          </span>
                        </span>
                        <button type="button" className="randomize-stroke-width btn btn-flat btn-sm" data-toggle="tooltip" title="Randomize" onClick={this.randomizeStrokeWidth}>
                          <i className="fa fa-random"></i>
                        </button>
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
                <div className="col-sm-3 col-md-2">
                  <LinesList lines={this.state.lines} loadLine={this.loadLine} currentLineID={this.state.currentLineID} />
                </div>
              </div>
            </div>
            <div role="tabpanel" className="tab-pane fade" id="source-tab">
              <pre>&lt;svg version="1.1" xmlns="http://www.w3.org/2000/svg"&gt;<br />
    {this.getPolylineSource()}
  &lt;/svg&gt;</pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

React.render(<SvgScribblerApp />, mountNode);
