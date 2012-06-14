
lychee.define('game.entity.Unit').includes([
	'lychee.game.Entity'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		lychee.game.Entity.call(this, this.settings);

		this.sprite = this.settings.sprite;

		this.__states = {};
		this.__state = null;

		this.__rotation = 0;
		this.__cannonRotation = 0;

		this.__parseStates(this.settings.spritemap);


		var state = this.settings.state || 'default';
		this.setState(state);

	};


	Class.prototype = {

		getModel: function() {
			return this.settings.model || null;
		},

		focus: function(position) {

			var ownPosition = this.getPosition();

			var deltaX = position.x - ownPosition.x;
			var deltaY = position.y - ownPosition.y;

			var angle = (Math.atan2(deltaX, deltaY) / Math.PI * 180) + 180;

			if (this.getState('cannon') !== null) {
				this.__cannonRotation = Math.round(angle);
			}

		},

		move: function(position) {

			var ownPosition = this.getPosition();

			var deltaX = position.x - ownPosition.x;
			var deltaY = position.y - ownPosition.y;

			var angle = (Math.atan2(deltaX, deltaY) / Math.PI * 180) + 180;


			// FIXME: This needs to be interpolated over time,
			// e.g. via model settings "degreepersecond" - or "generic" agility value?
			this.__rotation = angle % 360;

			var distance = Math.sqrt( Math.pow(Math.abs(deltaX), 2) + Math.pow(Math.abs(deltaY), 2) );
			var time = 1000 * distance / this.settings.speed;

			if (time === Infinity) {
				return null;
			}

			this.setTween(time, {
				x: position.x,
				y: position.y,
				z: 0
			});

			return time;

		},

		rotate: function(degree) {
			this.__rotation = (this.__rotation + degree) % 360;
		},

		rotateCannon: function(degree) {
			this.__cannonRotation = (this.__cannonRotation + degree) % 360;
		},

		setState: function(id) {

			var state = this.__states[id] || null;
			if (state !== null) {

				if (state.animated === true) {

					var frames = (state.to - state.from) + 1;

					var time = 5000;
					var fps = 25;

					if (state.fps !== undefined) {
						time = frames * state.fps * 1000;
						fps = state.fps;
					}

					this.setAnimation(time, {
						frames: frames,
						fps: fps
					}, true);

				}

				this.__state = state;

			} else {

				this.__state = null;

			}

		},

		getState: function(id) {

			if (id === undefined) {
				return this.__state;
			} else {
				return this.__states[id] || null;
			}

		},

		getMap: function(id) {

			var state = this.getState(id);

			var tile = this.settings.sprite.height;

			var map = {
				x: 0,
				y: 0,
				w: tile,
				h: tile
			};

			if (state !== null) {

				map.x = state.from * tile;

				if (id === 'default' && this.__rotation !== 0) {

					map.x += Math.floor(32 * this.__rotation / 360) * tile;

				} else if (id === 'cannon' && this.__cannonRotation !== 0) {

					map.x += Math.floor(32 * this.__cannonRotation / 360) * tile;

				} else if (state.animated === true && this.__animation !== null) {

					if (this.__animation.frame <= state.to) {
						map.x += this.__animation.frame * tile;
					}

				}

			}


			return map;

		},

		__parseStates: function(map) {

			for (var stateId in map) {

				if (this.__states[stateId] === undefined) {
					this.__states[stateId] = {};
				}

				var state = map[stateId];

				this.__states[stateId] = {
					from: state.from || 0,
					to: state.to || 0,
					animated: state.animated === true ? true : false
				};

			}

		}

	};


	return Class;

});

