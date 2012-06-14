
lychee.define('game.logic.Main').requires([
	'game.logic.Hitmap',
	'game.logic.Pathfinder'
]).exports(function(lychee, global) {

	var _logic = game.logic;

	var Class = function(game, settings) {

		this.game = game;
		this.settings = lychee.extend({}, this.defaults, settings);

		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;
		this.__clock = null;

		this.__layers = {
			objects: [],
			sky: [],
			terrain: []
		};

		this.__selected = [];
		this.__selectedUnits = null;


		this.hitmap = new _logic.Hitmap(this);

		this.pathfinder = new _logic.Pathfinder(this, {
			hitmap: this.hitmap,

			// FIXME: This needs to be updated via level data
			size: {
				x: 100,
				y: 100
			}
		});

	};


	Class.prototype = {

		defaults: {
		},

		setLayers: function(layers) {

			// FIXME: This needs to be structured better...

			this.__layers = {
				objects: []
			};

			if (Object.prototype.toString.call(layers.terrain) === '[object Array]') {
				this.__layers.terrain = layers.terrain;
			} else {
				this.__layers.terrain = [];
			}

			if (Object.prototype.toString.call(layers.objects) === '[object Array]') {

				for (var o = 0, ol = layers.objects.length; o < ol; o++) {

					var object = layers.objects[o];
					var model = object.getModel();

					if (model) {
						this.__updateHitmap(object);
						this.__layers.objects.push(object);
					}

				}

			}

			if (Object.prototype.toString.call(layers.sky) === '[object Array]') {
				this.__layers.sky = layers.sky;
			} else {
				this.__layers.sky = [];
			}

		},

		update: function(clock, delta) {

			var layer, l, ll, entity;

			layer = this.getLayer('objects');
			for (l = 0, ll = layer.length; l < ll; l++) {
				layer[l].update(clock, delta);
			}


			layer = this.getLayer('sky');
			for (l = 0, ll = layer.length; l < ll; l++) {
				layer[l].update(clock, delta);
			}

		},

		render: function() {

			var layer, l, ll, entity;

			layer = this.getLayer('terrain');
			for (l = 0, ll = layer.length; l < ll; l++) {
				this.__renderer.renderEntity(layer[l]);
			}


			layer = this.getLayer('objects');
			for (l = 0, ll = layer.length; l < ll; l++) {
				this.__renderer.renderEntity(layer[l]);
			}


			layer = this.getLayer('sky');
			for (l = 0, ll = layer.length; l < ll; l++) {
				this.__renderer.renderEntity(layer[l]);
			}


			for (var s = 0; s < this.__selected.length; s++) {
				this.__renderer.renderEntityInfo(this.__selected[s]);
			}

		},

		toGridPosition: function(position) {

			var tilePos = {
				x: position.x,
				y: position.y
			};

			var tile = this.game.settings.tile;

			tilePos.x /= tile;
			tilePos.y /= tile;

			tilePos.x = Math.round(tilePos.x);
			tilePos.y = Math.round(tilePos.y);


			return tilePos;

		},

		toPixelPosition: function(position) {

			var pxPos = {
				x: position.x,
				y: position.y
			};


			var tile = this.game.settings.tile;

			pxPos.x *= tile;
			pxPos.y *= tile;


			return pxPos;

		},

		getLayer: function(id) {
			return this.__layers[id];
		},


		isObjectAtPosition: function(entity, position) {

			var pos = entity.getPosition();
			var sw = entity.sprite.height;

			var box = {
				x1: pos.x - sw / 2,
				x2: pos.x + sw / 2,
				y1: pos.y - sw / 2,
				y2: pos.y + sw / 2
			};

			if (
				position.x > box.x1 && position.x < box.x2
				&& position.y > box.y1 && position.y < box.y2
			) {
				return true;
			}


			return false;

		},

		getObjectByPosition: function(position) {

			var l, ll, layer, entity;

			layer = this.getLayer('sky');

			for (l = 0, ll = layer.length; l < ll; l++) {

				entity = layer[l];

				if (this.isObjectAtPosition(entity, position) === true) {
					return entity;
				}
			}


			layer = this.getLayer('objects');

			for (l = 0, ll = layer.length; l < ll; l++) {

				entity = layer[l];

				if (this.isObjectAtPosition(entity, position) === true) {
					return entity;
				}
			}


			return null;

		},

		isSelected: function(object) {

			if (object === undefined && this.__selected.length) return true;

			for (var s = 0, l = this.__selected.length; s < l; s++) {

				if (this.__selected[s] === object) {
					return true;
				}
			}

			return false;

		},

		select: function(object) {
			if (this.isSelected(object) === false) {
				this.__selected.push(object);
			}
		},

		deselect: function(object) {

			if (object === true) {
				this.__selected = [];
				return;
			} else if (this.isSelected(object) === false) {
				return;
			}


			for (var s = 0, l = this.__selected.length; s < l; s++) {
				if (this.__selected[s] === object) {
					this.__selected.splice(s, 1);
					l--;
				}
			}

		},

		focus: function(position) {

			if (this.__selected.length > 0) {

				for (var s = 0, l = this.__selected.length; s < l; s++) {
					if (this.__selected[s].focus !== undefined) {
						this.__selected[s].focus(position);
					}
				}

			}

		},

		move: function(position) {

			if (this.__selected.length > 0) {

				var leader = this.__selected[0];

				var from = this.toGridPosition(leader.getPosition());
				var to = this.toGridPosition(position);

				var path = this.pathfinder.start(from, to);
				if (path !== null) {

					if (this.__selected[0].isMoving !== true) {

						// Remove the start position :)
						path.splice(0, 1);
						this.moveAlongPath(this.__selected[0], path);

					} else {
						// Unit is already moving
					}

				}

			}

		},

		moveAlongPath: function(entity, path, index) {

			index = typeof index === 'number' ? index : 0;

			if (path[index] === undefined) {

				entity.isMoving = false;
				// Unit arrived at path[index - 1];
				return;

			} else if (entity.isMoving === undefined) {

				entity.isMoving = true;

			}

			var position = this.toPixelPosition(path[index]);
			var duration = entity.move(position);

			if (duration === null) {
				return;
			}

			this.__loop.timeout(duration, function() {
				this.moveAlongPath(entity, path, ++index);
			}, this);

		},

		attack: function(position) {

			var object = this.getObjectByPosition(position);
			if (object === null) {
				object = position;
			}

			for (var s = 0, l = this.__selected.length; s < l; s++) {

				if (this.__selected[s].attack !== undefined) {
					this.__selected[s].attack(object);
				} else if (this.__selected[s].setDock !== undefined) {
					this.__selected[s].setDock(position);
				}

			}

		},

		__updateHitmap: function(entity) {

			var model = entity.getModel();
			var position = this.toGridPosition(entity.getPosition());

			if (model.grid !== null) {

				var minX = position.x - Math.floor(model.grid.x / 2);
				var maxX = position.x + Math.floor(model.grid.x / 2);

				var minY = position.y - Math.floor(model.grid.y / 2);
				var maxY = position.y + Math.floor(model.grid.y / 2);

				for (var x = minX; x <= maxX; x++) {
					for (var y = minY; y <= maxY; y++) {

						this.hitmap.set(
							x,
							y,
							_logic.Hitmap.TYPE.destructable
						);

					}
				}

			} else if (model.type === 'Mountain') {
			// } if (model.type === 'Building'){

				this.hitmap.set(
					position.x,
					position.y,
					_logic.Hitmap.TYPE.indestructable
				);

			}

		}

	};


	return Class;

});

