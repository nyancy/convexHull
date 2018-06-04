points = [];
var hull = [];
var inter = 0.000244140625;
pascal = [
    [1],
    [1, 1],
];

//variaveis para mover pontos
var isMoving;
moving = hidePoint = hidePolygon = hideCurve = false;


//atualização constante enquanto usuario move o ponto
document.onmousemove = movingPoint;

function movingPoint(event) {
    if (moving && points.length > 0) {
	var newpoints = points.slice();
	newpoints.splice(isMoving, 1);
	convexHull.remove(hull, newpoints, points[isMoving]);
	points[isMoving].x = event.clientX;
	points[isMoving].y = event.clientY;
	convexHull.insert(hull, points[isMoving]);
	requestAnimationFrame(draw);
    }
}

//funcao de distancia entre dois pontos
function distance(p0, p1) {
	var dx = p1.x - p0.x,
	    dy = p1.y - p0.y;
	return Math.sqrt(dx * dx + dy * dy);
}

//calcula a distancia entre o local clicado e posicao de outros pontos
function distanceMoving(currentPoint) {
    if (points.length > 0) {
	isMoving = 0;
	var distFromOthers = distance(currentPoint, points[0]);
	for (var i = 1; i < points.length; i += 1) {
	    if (distance(currentPoint, points[i]) < distFromOthers) {
		isMoving = i;
		distFromOthers = distance(currentPoint, points[i]);
	    }
	}
    }
    return distFromOthers
}

//calculo da curva de bezier usando casteljau
function nBezier(points, t, currentBezier) {
	var currentBezier = currentBezier || {};
	currentBezier.x = 0;
	currentBezier.y = 0;
	for (var i = 0; i < points.length; i += 1) {
	    while (points.length > pascal.length) {
		extendPascal();
	    }
	    var casteljau = (pascal[points.length - 1][i])*Math.pow(1 - t, points.length - 1 - i)*Math.pow(t, i);
	    //temp = temp*Math.pow(1 - t, points.length - 1 - i)*Math.pow(t, i);
	    currentBezier.x += casteljau*points[i].x;
	    currentBezier.y += casteljau*points[i].y;
	}
	return currentBezier;
}


function extendPascal() {
    var newLine = [1];
    for (var i = 0; i < (pascal[pascal.length - 1].length - 1); i+= 1) {
	newLine.push(pascal[pascal.length - 1][i] +
		     pascal[pascal.length - 1][i+1]);
	}
    newLine.push(1);
    pascal.push(newLine);
}

//adicionar/remover pontos
document.onclick = function(event) {

    var currentPoint = {x: event.clientX, y: event.clientY};
	var distFromOthers = distanceMoving(currentPoint);

	var rightclick, leftclick;
	if (!event) event = window.event;
	if (event.which) {
	    rightlick = (event.which == 3);
	    leftclick = (event.which == 1);
	} else if (event.button) {
	    rightlick = (event.button == 2);
	    leftclick = (event.button == 0);
	}
	if (leftclick) {
		//se estiver movendo ponto, defina essa posicao como a nova posicao
	    if (moving) {
		moving = false;
	    }
	    //se usuario clicar em ponto ja existente, comeca movimento 
	    else if (distFromOthers < 12) {
		moving = true;
	    }
	    //inserir ponto normalmente
	    else {
		points.push(currentPoint);
		convexHull.insert(hull, {x: event.clientX, y: event.clientY});
	    }

	} else if (rightlick) {
		//se estiver movendo ponto, defina essa posicao como a nova posicao
	    if (moving) moving = false;
	    //remove ponto
	    else {
		var p;
		//se clicar em algum ponto, remove o ponto indicado
		if (distFromOthers < 12) {
		    var p = points[isMoving];
		    points.splice(isMoving, 1);
		} 
		//se nao, remove o ultimo ponto
		else {
		    var p = points.pop();
		}
		convexHull.remove(hull, points, p);
	    }
	}

    requestAnimationFrame(draw);
};

//esconde pontos de controle com as teclas 1, 2, 3 e 4
document.onkeypress = function(event) {
	if (!event) event = window.event;
	var char = event.which || event.keyCode;
	if (char==49) hidePoint = !hidePoint;
	if (char==50) hideCurve = !hideCurve;
	if (char==51) hidePolygon = !hidePolygon;
	if (char==52) {
		inter = 1/(Math.max(parseFloat(prompt("Number of Interactions","4096")),2));
    	inter = isNaN(inter) ? 0.000244140625 : inter;
	}

	requestAnimationFrame(draw);
};


//definindo a tela e seu tamanho
var canvas, context, width, height
window.onload = function() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    draw();
};

//funcao para desenhar na tela
function draw() {

    context.clearRect(0, 0, width, height);

    context.fillStyle = "#2C2F33";
	context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "gray";
    context.strokeStyle="lightgray";

    context.lineWidth=4;
	if(hull.length > 0) {
	    context.strokeStyle="#7289DA";
	    for (var i = 0; i < hull.length - 1; i += 1) {
		context.beginPath();
		context.moveTo(hull[i].x, hull[i].y);
		context.lineTo(hull[i+1].x, hull[i+1].y);
		context.stroke();
	    }
	    context.beginPath();
	    context.moveTo(hull[hull.length - 1].x, hull[hull.length - 1].y);
	    context.lineTo(hull[0].x, hull[0].y);
	    context.stroke();
	}
    context.lineWidth=1;

    context.strokeStyle="#C74040";
    
    for (var i = 0; i < points.length - 1; i += 1) {
    //linha que liga os pontos adjacentes
    if (!hidePolygon) {
	context.beginPath();
	context.moveTo(points[i].x, points[i].y);
	context.lineTo(points[i+1].x, points[i+1].y);
	context.stroke();
	}
	if (i == 0) context.fillStyle = "black";
	else context.fillStyle = "#99AAB5";

	//informacoes de cada ponto
	if (!hidePoint) {
	context.font="20px Arial";
	context.fillText("b" + i, 
					 points[i].x + 10,
					 points[i].y + 10);

	context.fillText("(" + Math.round(points[i].x) + ", " + Math.round(points[i].y) + ")",
					 points[i].x + 10,
					 points[i].y + 35);
	}
    }
    if (!hidePoint) {
    if (points.length > 0) {
	context.fillStyle = "black";
	context.font="20px Arial";
	context.fillText("b" + (points.length - 1),
					 points[points.length - 1].x + 10,
					 points[points.length - 1].y + 10);

	context.fillText("(" + Math.round(points[points.length - 1].x) + ", " + Math.round(points[points.length - 1].y) + ")",
					 points[points.length - 1].x + 10, 
					 points[points.length - 1].y + 35);
	}
    }
    
    var currentBezier = {};
    var previousBezier = {};
	context.strokeStyle="#99AAB5";

	if (points.length > 0) {
	previousBezier.x = points[0].x;
	previousBezier.y = points[0].y;

	//construcao da curva de bezier em 4096 pontos
	if (!hideCurve){
	for(var t = 0; t <= 1; t += inter) {
		nBezier(points, t, currentBezier);
		context.beginPath();
		context.moveTo(previousBezier.x, previousBezier.y);
		context.lineTo(currentBezier.x, currentBezier.y);
		context.stroke();
		previousBezier.x = currentBezier.x;
		previousBezier.y = currentBezier.y;
	}
	context.beginPath();
	context.moveTo(previousBezier.x, previousBezier.y);
	context.lineTo(points[points.length-1].x, points[points.length-1].y);
	context.stroke();
	}
	}

	//construcao do ponto
    if (!hidePoint) {
	for (var i = 0; i < points.length; i += 1) {
	    if (i == 0 || i == points.length - 1) {
		context.strokeStyle = context.fillStyle = "black";
	    } else {
		context.strokeStyle = context.fillStyle = "#99AAB5";
	    }
	    context.beginPath();
	    context.arc(points[i].x, points[i].y, 6, 0, Math.PI * 2, false);

	    context.fill();
	}
	}

  
}
