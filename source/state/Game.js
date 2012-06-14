
lychee.define('game.state.Game').includes([
	'lychee.game.State',
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'game');

		this.__data = this.game.data;
		this.__input = this.game.input;
		this.__logic = this.game.logic;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__locked = false;

		this.__music = [
			'act-on-instinct',
			'just-do-it'
		];

	};


	Class.prototype = {

		load: function(level) {

			var layers = {
				terrain: [],
				objects: [],
				sky: []
			};


			var tile = this.game.settings.tile;


			for (var teamId in level) {

				var team = level[teamId];

				if (typeof team.credits === 'number') {
					this.__data.set(teamId, 'credits', team.credits);
				}


				for (var b = 0, l = team.belongings.length; b < l; b++) {

					var object = team.belongings[b];
					var model = this.game.models[object.id] || null;


					if (model === null) continue;


					var speed = tile * model.speed || 0;

					var entity = null;
					if (game.entity[object.id] !== undefined) {

						entity = new game.entity[object.id]({
							model: model,
							health: object.health || model.health,
							state: object.state || null,
							speed: speed,
							position: {
								x: object.x * tile || 0,
								y: object.y * tile || 0,
								z: object.z * tile || 0
							},
							sprite: model.sprite,
							spritemap: model.spritemap
						});

					} else if (game.entity[model.type] !== undefined) {

						entity = new game.entity[model.type]({
							model: model,
							health: object.health || model.health,
							state: object.state || null,
							speed: speed,
							position: {
								x: object.x * tile || 0,
								y: object.y * tile || 0,
								z: object.z * tile || 0
							},
							sprite: model.sprite,
							spritemap: model.spritemap
						});

					}


					// FIXME: Sort this somehow better, because
					// Sky Units or Trees are kind of not matching here :/
					switch(model.type) {
						case 'Unit':
						case 'Building':
							layers.objects.push(entity);
						break;
						case 'Terrain':
							layers.terrain.push(entity);
						break;
					}

				}

			}

			this.__logic.setLayers(layers);

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			this.__currentMusic = this.__music[Math.round(Math.random() * (this.__music.length - 1))];

			this.game.jukebox.playMusic(this.__currentMusic);

			this.__input.bind('touch', this.__processTouch, this);
			this.__input.bind('move', this.__processMove, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);
			this.__input.unbind('move', this.__processMove);

			this.game.jukebox.stopMusic(this.__currentMusic);

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {
			this.__logic.update(clock, delta);
		},

		render: function(clock, delta) {

			this.__renderer.clear();
			this.__renderer.renderGrid(this.game.settings.tile);

			var hitmap = this.__logic.hitmap.all();
			var tile = this.game.settings.tile;

			for (var x = 0; x < hitmap.length; x++) {
				for (var y = 0; y < hitmap[0].length; y++) {

					if (hitmap[x][y] !== 0) {

						if (hitmap[x][y] > 1) {
							color = 'rgba(255,0,0,0.2)';
						} else if (hitmap[x][y] > 0) {
							color = 'rgba(0,255,0,0.2)';
						}

						this.__renderer.drawBox(
							x * tile - tile / 2,
							y * tile - tile / 2,
							x * tile + tile / 2,
							y * tile + tile / 2,
							color,
							true
						);

					}

				}
			}

			this.__logic.render(clock, delta);

		},

		__offset: function(position) {

			var offset;

			offset = this.game.getOffset();

			position.x -= offset.x;
			position.y -= offset.y;

			offset = this.__renderer.getOffset();

			position.x += offset.x;
			position.y += offset.y;

		},

		__processTouch: function(position, delta, modifier) {

			if (this.__locked === true) return;

			this.__offset(position);


			var object = this.__logic.getObjectByPosition(position);
			if (object !== null) {

				this.__logic.deselect(true);
				this.__logic.select(object);

				/*
				if (this.__logic.isSelected(object) === true) {
					this.__logic.deselect(object);
				} else {
					this.__logic.select(object);
				}
				*/

			} else if (this.__logic.isSelected() === true) {

				if (modifier === 'ctrl') {
					this.__logic.attack(position);
				} else {
					this.__logic.move(position);
				}

			}

		},

		__processMove: function(position, delta) {

			if (this.__locked === true) return;

			this.__offset(position);


			this.__logic.focus(position);

		}

	};


	return Class;

});
