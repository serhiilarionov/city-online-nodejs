dojo.require("dijit.form.Form");
dojo.require("dojox.validate.web");


// // // stores the device context of the canvas we use to draw the outlines
// initialized in myInit, used in myHover and myLeave
var hdc;


dojo.ready(function() {
  initMap();

  dojo.on(dijit.byId("city"), "click", function() {this.loadDropDown();});
  dojo.on(dijit.byId("city"), "change", function() {this.set("displayedValue", dojo.trim(this.get("displayedValue")));});
  dojo.on(dijit.byId("city"), "keyup", function(e) {
	var key = e.charCode || e.keyCode;
	// do nothing if arrow keys pressed
	if (key == 37 || key == 38 || key == 39 || key == 40) {

	} else if (key == 13 || key == 27) {
	  // else close dropdown when Esc or Enter pressed
	  this.closeDropDown();
	} else if (key == 32) {
	  //dijit.byId("city")._startSearch(dijit.byId("city").get("displayedValue"));
	  dijit.byId("city")._startSearch(dojo.trim(dijit.byId("city").get("displayedValue"))+" ");
	} else
	  dijit.byId("city")._startSearch(dojo.trim(dijit.byId("city").get("displayedValue")));
  });
  dijit.byId("city")._onKey(function(e) {
	if (e.charCode == 13 || e.charCode == 27) {
	  this.closeDropDown();
	}
  });
});

// function to clear filteringselect field when pressed any key
function clearField(elem) {
  elem.attr("value", "");
}

// shorthand func
function byId(e){return document.getElementById(e);}

// takes a string that contains coords eg - "227,307,261,309, 339,354, 328,371, 240,331"
// draws a line from each co-ord pair to the next - assumes starting point needs to be repeated as ending point.
function drawPoly(coOrdStr)
{
  var mCoords = coOrdStr.split(',');
  var i, n;
  n = mCoords.length;

  hdc.beginPath();
  hdc.moveTo(mCoords[0], mCoords[1]);
  for (i=2; i<n; i+=2)
  {
	hdc.lineTo(mCoords[i], mCoords[i+1]);
  }
  hdc.lineTo(mCoords[0], mCoords[1]);
  hdc.fill();
}

function drawRect(coOrdStr)
{
  var mCoords = coOrdStr.split(',');
  var top, left, bot, right;
  left = mCoords[0];
  top = mCoords[1];
  right = mCoords[2];
  bot = mCoords[3];
  hdc.strokeRect(left,top,right-left,bot-top);
}

function myHover(element)
{
  // for now
  // @NOTE when use myHover then you'll need to set can.style.zIndex = 1;
  // but in that case hint tootip (title) will not work in Opera
  return false;

  var hoveredElement = element;
  var coordStr = element.getAttribute('coords').toLowerCase();
  var areaType = element.getAttribute('shape').toLowerCase();

  switch (areaType)
  {
	case 'polygon':
	case 'poly':
	  drawPoly(coordStr);
	  break;

	case 'rect':
	  drawRect(coordStr);
  }
}

function myLeave()
{
  // for now
  return false;
  var canvas = byId('canvas');
  hdc.clearRect(0, 0, canvas.width, canvas.height);
}

function initMap()
{
  // get the target image
  var img = byId('map_img');

  var x,y, w,h;

  // get it's position and width+height
  x = img.offsetLeft;
  y = img.offsetTop;
  w = img.clientWidth;
  h = img.clientHeight;

  // move the canvas, so it's contained by the same parent as the image
  var imgParent = img.parentNode;
  var can = byId('canvas');
  imgParent.appendChild(can);

  // place the canvas in front of the image
  //can.style.zIndex = 1;
  can.style.zIndex = -1;

  // position it over the image
  can.style.left = x+'px';
  can.style.top = y+'px';

  // make same size as the image
  can.setAttribute('width', w+'px');
  can.setAttribute('height', h+'px');

  // get it's context
  hdc = can.getContext('2d');

  // set the 'default' values for the colour/width of fill/stroke operations
  hdc.fillStyle = '#F7702D';
  hdc.strokeStyle = '#F7702D';
  hdc.lineWidth = 1;
}

function handleBidStartForm() {
  if (!dijit.byId("bid_form_short").validate())
	return false;
  var cityID = dijit.byId("city").get("value");

  dojo.xhrPost({
	url: "/article/redirecting",
	content: {cityID: cityID},
	load: function(data) {
	  if (data.match(/^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/))
		window.location = data;
	  else
		return false;
	},
	error: function(error) {}
  });
}