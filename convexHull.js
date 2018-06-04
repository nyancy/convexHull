var convexHull = {
	lpDistance: function (l1, l2, p) {	
		return (l2.x - l1.x) * (p.y - l1.y) - (l2.y - l1.y) * (p.x - l1.x);
	},
	
	insert: function(hull, newpoint) {
		//caso com apenas um ponto ou nenhum
		if (hull.length < 2) {
			hull.push(newpoint);
		//excecao quando ha exatamente dois pontos
		} else if (hull.length === 2) {
			var lpd = this.lpDistance(hull[0], hull[1], newpoint);
			if (lpd > 0)
			{
				hull.push(newpoint);
			} else if (lpd < 0) {
				hull.splice(1,0,newpoint);
			}
		} else {
			
			//calculando pontos tangenciais
			var counter = 0;
			var ltan = -1;
			var rtan = -1;
			var ltnf = true;
			var rtnf = true;
			var previousLPD = this.lpDistance(newpoint, hull[0], hull[hull.length - 1]);
			var nextLPD  = this.lpDistance(newpoint, hull[0], hull[1]);
			
			while (ltnf || rtnf) {
				if (previousLPD > 0 && nextLPD > 0) {
					rtnf = false;
					rtan = counter;
				} else if (previousLPD < 0 && nextLPD < 0) {
					ltnf = false;
					ltan = counter;
				}
				counter += 1;
				if(counter === hull.length) break;
				previousLPD = this.lpDistance(newpoint, hull[counter], hull[(counter + hull.length - 1)%hull.length]);
				nextLPD  = this.lpDistance(newpoint, hull[counter], hull[(counter + 1)%hull.length]);
			}
			
			//caso ponto esteja dentro do involucro
			if (ltan === -1 || rtan === -1) return;
			
			//caso seja um ponto novo, iremos inserir na lista e remover os que estao dentro agora
			if (ltan < rtan) {
				hull.splice(ltan + 1, rtan - ltan - 1, newpoint);
			} else {
				hull.splice(ltan + 1, hull.length, newpoint);
				hull.splice(0,rtan);
			}
		}
	},
	
	remove: function(hull, points, removePoint) {
		//procurar o index do ponto a ser removido
		var index = -1;
		for (var i = 0; i < hull.length; ++i) {
			if (hull[i].x === removePoint.x && hull[i].y === removePoint.y) {
				index = i;
				break;
			}
		}
		//se nao fizer parte do involucro, ignore
		if (index === -1) return;
		
		//encontraremos os pontos adjacentes primeiro
		var prev, next;
		if (index === hull.length-1) {
			prev = hull.length-2;
			next = 0;
		} else if (index === 0) {
			prev = hull.length-1;
			next = 1;
		} else {
			prev = index-1;
			next = index+1;
		}
		p1 = hull[prev];
		p2 = hull[next];
		hull.splice(index,1);
		
		//calcularemos a distancia de todos os pontos a reta encontrada
		var highPoint = -1;
		var highDistance = 0.0;
		var subhullPoints = [];
		for (var i = 0; i < points.length; ++i) {
			var point = points[i];
			var lpd = this.lpDistance(p2, p1, point);
			if (lpd > highDistance) {
				highDistance = lpd;
				if (highPoint != -1) subhullPoints.push(highPoint);
				highPoint = point;
			} else if (lpd > 0) {
				subhullPoints.push(point)
			}
		}
		
		//se nenhum ponto ficou fora, ignore
		if(highPoint === -1) return;
		
		//criando o novo involucro
		var subhull = [p1,highPoint,p2];
		for (var i = 0; i < subhullPoints.length; ++i) {
			var point = subhullPoints[i];
			this.insert(subhull, point);
		}
		for (var c = subhull.length-2; c > 0; c--) {
			hull.splice(index, 0, subhull[c]);
		}
	}
}