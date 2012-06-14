
lychee.define('game.entity.Building').includes([
	'lychee.game.Entity'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		lychee.game.Entity.call(this, this.settings);

		this.sprite = this.settings.sprite;

		this.__states = {};
		this.__state = null;

		this.__parseStates(this.settings.spritemap);


		var state = this.settings.state || 'default';
		this.setState(state);

	};


	Class.prototype = {

		getModel: function() {
			return this.settings.model || null;
		},

		setState: function(id) {

			var state = this.__states[id] || null;
			if (state !== null) {

				if (state.animated === true) {

					var frames = (state.to - state.from) + 1;

					this.setAnimation(1000, {
						frames: frames,
						fps: state.fps
					}, true);

				}

				this.__state = id;

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

				if (state.animated === true && this.__animation !== null) {

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

				if (state.animated === true) {
					this.__states[stateId].fps = state.fps || 25;
				}

			}

		}

	};


	return Class;

});

