

var test = 0;
var x=0, y=0;
var max = 3;
var states = new Array(max);
var stateX = new Uint16Array(max);
var stateY = new Uint16Array(max);
var dx=0, dy=0;

var r = 20;
var PI2 = 2 * Math.PI 
var minDistance = r*4;

//enum t_state {SEARCH, DRAG};
var state = 0;
var ix = -1;


/*============================================================================*/
function init()
{
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    ctx.fillStyle = "gray";
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(0,0,255,0.5)";
	ctx.font = "12pt Tahoma";
    ctx.textAlign = "left";

	canvas.addEventListener('mousedown', ev_mousedown, false);
	canvas.addEventListener('mouseup', ev_mouseup, false);
	canvas.addEventListener('mousemove', ev_mousemove, false);
	canvas.addEventListener('dragstart', ev_dragstart, false);


	var x = 0;
	var y = minDistance;
	for(var i=max; i-- >0;) {
		x += minDistance
		if (x > canvas.width-minDistance ) { x=minDistance; y+=minDistance; }
		stateX[i] = x;
		stateY[i] = y;
	}

	draw_states();
	draw_debug();
}

window.onload = function() { 
	init(); 
}


/*============================================================================*/
/*{
	Drawing functions
}*/
function draw_debug() {

	var s = "x:" + x.toString() + " y:" + y.toString();

	var fillStyle = ctx.fillStyle;
	ctx.fillStyle = "gray";
	ctx.clearRect(0, 0, 100, 50)
	ctx.fillText(s, 0, 20)
	ctx.fillStyle = fillStyle;

	s = test.toString();
	ctx.fillText(s, 0, 40)
}

function draw_State(x, y)
{
	var fillStyle = ctx.fillStyle;
	ctx.fillStyle = "rgba(0,0,255,0.2)";
	ctx.beginPath();
    ctx.arc(x, y, r, 0, PI2, true);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = fillStyle;
}

function draw_MarkedState(x, y)
{
	var fillStyle = ctx.fillStyle;
	ctx.fillStyle = "rgba(142,214,255,0.5)";
	ctx.beginPath();
    ctx.arc(x, y, r, 0, PI2, true);
    ctx.fill();
    ctx.stroke();
	ctx.beginPath();
    ctx.arc(x, y, r+4, 0, PI2, true);
    ctx.stroke();
    ctx.fillStyle = fillStyle;
}


function draw_states() {
	for(var i=max; i-- >0;) {
		draw_State(stateX[i], stateY[i]);
	}
	draw_edge(stateX[0], stateY[0], stateX[1], stateY[1]);
}

function update() {
	draw_states();
	draw_debug();	
}

function draw_edge(x1, y1, x2, y2) {
	'use strict'
	var dx = x2-x1;
	var dy = y2-y1;
	// Length of vector 1->2
	var dl = Math.sqrt(dx*dx + dy*dy);
	if (dl == 0) { return; }
	// Normalized vector 1->2
	var nx = dx / dl;
	var ny = dy / dl;
	// Orthogonal vector
	var ox =  ny;
	var oy = -nx;
	// Edge coordinates
	x1 = x1 + r*nx;
	y1 = y1 + r*ny;
	x2 = x2 - r*nx;
	y2 = y2 - r*ny;
	// Arrow coordinates 
	// 10 - length of the arrow
	// 8 - width of the arrow
	var x3 = x2 - (10 * nx) + (4 * ox);
	var y3 = y2 - (10 * ny) + (4 * oy);
	var x4 = x3 - (8 * ox);
	var y4 = y3 - (8 * oy);

	ctx.save();
	ctx.fillStyle = "black";
	ctx.strokeStyle = "black";

	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();

	ctx.lineTo(x3, y3);
	ctx.lineTo(x4, y4);
	ctx.lineTo(x2, y2);
	ctx.fill();
	ctx.restore();
}

/*============================================================================*/
/*{
	Geometrical functions
}*/

function get_state(x, y) {
	ret = -1;
	//for(var i in stateX) {
	for(var i=max; i-- >0;) {
		if ((x > stateX[i]-r) && 
			(x < stateX[i]+r) &&
			(y > stateY[i]-r) &&
			(y < stateY[i]+r))
		{
			ret = i;
			break;
		}
	}
	return ret;
}

/*============================================================================*/
/*{
	Automata
}*/

function a_drag(ev) {
	switch(state) {
		case 0: //waiting for down
			if(ev != 0) { break; }
			ix = get_state(x,y)
			if(ix >-1) { 
				//Difference between coordinates of
				//mouse and the center of circle.
				dx = stateX[ix] - x;
				dy = stateY[ix] - y;
				state = 1; 
			}
		break;

		case 1: //waiting for up
			if(ev != 1) { state = 0; break; }
			stateX[ix] = x + dx;
			stateY[ix] = y + dy;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			update();
		break;
	}
}


/*============================================================================*/
/*{
	Mouse handlers
}*/
function ev_mousedown(ev) {
	x = ev.offsetX;
	y = ev.offsetY;
	a_drag(0);
	draw_debug();
}

function ev_mouseup(ev) {
	draw_debug();
	a_drag(2);
}

function ev_mousemove(ev) {
	x = ev.offsetX;
	y = ev.offsetY;
	a_drag(1);
}

function ev_dragstart(ev) {
	//a_drag(0);
}