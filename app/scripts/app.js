/** @jsx React.DOM */

var React = window.React = require('react'),
    mountNode = document.getElementById('app');

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
        </div>
      </li>
    );
  }
});

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
    return (
      <div style={this.getContainerStyle(visibleLines)}>
        <h4>Scribbles:</h4>
        <ul className="lines-list list-unstyled">
          {
            visibleLines.map(function(line) {
              return (
                <LineItem key={line.id} line={line} />
              );
            })
          }
        </ul>
      </div>
    );
  }
});

var SvgScribblerApp = React.createClass({
  getInitialState: function() {
    var colors = randomColor({count: 2});
    return {
      lines: [{
        points: [],
        stroke: colors[0],
        fill: colors[1],
        strokeWidth: 3,
        id: 1
      }],
      isDrawing: false
    };
  },
  adjustSvgSize: function() {
    var svgWrapper = $('.svg-container');
    var footer = $('.footer');
    var height = $(window).height();
    height = height - svgWrapper.offset().top - footer.height();
    svgWrapper.css('height', height);
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
        strokeWidth: lastLine.strokeWidth,
        id: this.state.lines.length + 1
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
  setLineColor: function(type, color) {
    $('#' + type + '-color-picker').spectrum('set', color);
    var line = this.getCurrentLine();
    line[type] = color;
    this.updateCurrentLine(line);
  },
  randomizeStroke: function() {
    this.setLineColor('stroke', randomColor());
  },
  randomizeFill: function() {
    this.setLineColor('fill', randomColor());
  },
  clearStroke: function() {
    this.setLineColor('stroke', 'transparent');
  },
  clearFill: function() {
    this.setLineColor('fill', 'transparent');
  },
  setStrokeWidth: function(e) {
    var slider = $(e.target);
    var line = this.getCurrentLine();
    line.strokeWidth = slider.val();
    this.updateCurrentLine(line);
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
                          <span className="help-inline">0</span>
                          <input onInput={this.setStrokeWidth} type="range" id="stroke-width-slider" min="0" value={this.getCurrentLine().strokeWidth} step="1" max="20" />
                          <span className="help-inline">20</span>
                        </span>
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
                  <LinesList lines={this.state.lines} />
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
