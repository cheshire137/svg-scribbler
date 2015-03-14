/** @jsx React.DOM */

var React = window.React = require('react'),
    mountNode = document.getElementById('app');

var SvgScribblerApp = React.createClass({
  getInitialState: function() {
    return {
      points: [],
      stroke: 'rgb(255,0,0)',
      fill: 'rgb(255,255,255)',
      strokeWidth: 3
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
              <canvas className="svg-canvas" onClick={this.onAddPoint}></canvas>
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
