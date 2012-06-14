
lychee.define('game.logic.Hitmap').exports(function(lychee, global) {

	var Class = function() {

		this.__map = {};
		this.__allCache = [];
		this.__dirty = true;

	};


	Class.TYPE = {
		free: 0,
		destructable: 1,
		indestructable: 2
	};


	Class.prototype = {

		all: function() {

			if (this.__dirty === true) {

				var maxX = 0;
				var maxY = 0;

				for (var id in this.__map) {

					var pos = id.split('x');

					maxX = Math.max(maxX, parseInt(pos[0], 10));
					maxY = Math.max(maxY, parseInt(pos[1], 10));

				}


				this.__allCache = [];

				for (var x = 0; x <= maxX; x++) {

					var row = [];

					for (var y = 0; y <= maxY; y++) {
						row.push(this.__map[x + 'x' + y] || 0);
					}

					this.__allCache.push(row);

				}

			}


			return this.__allCache;

		},

		set: function(x, y, value) {

			value = typeof value === 'number' ? value : 0;

			this.__map[x + 'x' + y] = value;
			this.__dirty = true;

		},

		isAccessible: function(x, y) {

			var entry = this.__map[x + 'x' + y];

			if (entry === undefined) {
				return true;
			} else if (entry > 0) {
				return false;
			}

			return true;

		},

		isDestructable: function(x, y) {
		}

	};


	return Class;

});

