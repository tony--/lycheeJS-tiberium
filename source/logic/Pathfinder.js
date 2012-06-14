
lychee.define('game.logic.Pathfinder').exports(function(lychee, global) {

	var Class = function(logic, settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

	};


	Class.prototype = {

		defaults: {
			size: {
				x: 100,
				y: 100
			},
			// defaulted non-blocking hitmap
			hitmap: {
				isAccessible: function(x, y) { return true; }
			}
		},

		start: function(from, to) {

			var start = this.__createNode(null, from);
			var goal  = this.__createNode(null, to);

			var distanceX = to.x - from.x;
			var distanceY = to.y - from.y;

			if (distanceX === 0 && distanceY === 0) {
				return null;
			}


			// hitmap.x * hitmap.y is false,
			// it has to be distance from point from.x/from.y * 2 or so?
			var limit = this.settings.size.x * this.settings.size.y;

			var alreadyVisited = {};
			var _open = [ start ];
			var _closed = [];

			var result = [];

			while(length = _open.length) {

				max = limit;
				min = -1;

				for (var o = 0; o < length; o++) {

					if (_open[o].f < max) {
						max = _open[o].f;
						min = o;
					}

				}


				var path;
				var node = _open.splice(min, 1)[0];

				if (node.value === goal.value) {

					_closed.push(node);
					path = _closed[_closed.length - 1];

					do {

						result.push({
							x: path.x,
							y: path.y
						});

					} while( path = path.parent );

					alreadyVisited = {};
					_open = [];
					_closed = [];

					result.reverse();

				} else {

					var successors = this.__successors(node.x, node.y);

					for (var s = 0, l = successors.length; s < l; s++) {

						path = this.__createNode(node, successors[s]);

						if (alreadyVisited[path.value] !== true) {

							path.g = node.g + this.__distance(successors[s], node);
							path.f = path.g + this.__distance(successors[s], goal);

							_open.push(path);

							alreadyVisited[path.value] = true;

						}


					}

					_closed.push(node);

				}

			}


			if (result.length) {
				return result;
			}


			return null;

		},


		__createNode: function(parent, point) {

			var size = this.settings.size;
			var value = 0;

			// ends with horizontally valued search
			if (size.x >= size.y) {
				value = point.x + point.y * size.x;

			// ends with vertically valued search
			} else {
				value = point.y + point.x * size.y;
			}


			return {
				parent: parent,
				value: value,
				x: point.x,
				y: point.y,
				f: 0,
				g: 0
			};

		},

		__distance: function(point, goal) {

			// EUCLIDEAN
			return Math.sqrt(Math.pow(point.x - goal.x, 2) + Math.pow(point.y - goal.y, 2));

			// MANHATTAN
			// return Math.abs(point.x - goal.x) + Math.abs(point.y - goal.y);

			// DIAGONAL
			// return Math.max(Math.abs(point.x - goal.x), Math.abs(point.y - goal.y));

		},

		__successors: function(x, y) {

			var N = y - 1;
			var S = y + 1;
			var W = x - 1;
			var E = x + 1;


			var hitmap = this.settings.hitmap;
			var size = this.settings.size;


			var checkNorth = N > -1 && hitmap.isAccessible(x, N) === true;
			var checkSouth = S < size.y && hitmap.isAccessible(x, S) === true;
			var checkWest  = W > - 1 && hitmap.isAccessible(W, y) === true;
			var checkEast  = E < size.x && hitmap.isAccessible(E, y) === true;


			var successors = [];

			checkNorth && successors.push({x: x, y: N });
			checkSouth && successors.push({x: x, y: S });
			checkWest && successors.push({x: W, y: y });
			checkEast && successors.push({x: E, y: y });

			this.__diagonalSuccessors(N, S, W, E, successors);

			return successors;

		},

		__diagonalSuccessors: function(N, S, W, E, successors) {

			var hitmap = this.settings.hitmap;
			var size = this.settings.size;

			var checkNorth = N > -1;
			var checkSouth = S < size.y;
			var checkWest  = W > -1;
			var checkEast  = E < size.x;


			if (checkEast) {

				if (checkNorth && hitmap.isAccessible(E, N) === true) {
					successors.push({x: E, y: N });
				}

				if (checkSouth && hitmap.isAccessible(E, S) === true) {
					successors.push({x: E, y: S });
				}

			}

			if (checkWest) {

				if (checkNorth && hitmap.isAccessible(W, N) === true) {
					successors.push({x: W, y: N });
				}

				if (checkSouth && hitmap.isAccessible(W, S) === true) {
					successors.push({x: W, y: S });
				}

			}

		}

	};


	return Class;

});

