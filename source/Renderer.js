
lychee.define('game.Renderer').requires([
	'game.entity.Text',
	'game.entity.Building',
	'game.entity.Unit'
]).includes([
	'lychee.Renderer'
]).exports(function(lychee, global) {

	var Class = function(game, settings) {

		lychee.Renderer.call(this);

		this.settings = lychee.extend({}, this.defaults, settings);

		this.__clock = 0;
		this.__delta = 0;

		this.__offset = {
			x: 0,
			y: 0
		};

	};

	Class.prototype = {

		clock: function(clock, delta) {
			this.__clock = clock;
			this.__delta = delta;
		},

		setOffset: function(x, y) {
			this.__offset.x = x;
			this.__offset.y = y;
		},

		getOffset: function() {
			return this.__offset;
		},

		getConvertedImage: function(image, shadowAlpha) {

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');

			canvas.width = image.width;
			canvas.height = image.height;

			ctx.drawImage(image, 0, 0, image.width, image.height);

			var imgData = ctx.getImageData(0, 0, image.width, image.height);

			for (var x = 0; x < image.width; x++) {
				for (var y = 0; y < image.height; y++) {

					var index = 4 * (x + y * image.width);

					if (
						imgData.data[index] === 0
						&& imgData.data[index + 1] === 0
						&& imgData.data[index + 2] === 0
						&& imgData.data[index + 3] === 255
					) {
						imgData.data[index + 3] = 0;
					} else if (
						imgData.data[index] === 85
						&& imgData.data[index + 1] === 255
						&& imgData.data[index + 2] === 85
					) {
						imgData.data[index] = 0;
						imgData.data[index + 1] = 0;
						imgData.data[index + 2] = 0;
						imgData.data[index + 3] = 254;
					}

				}
			}

			ctx.putImageData(imgData, 0, 0);

			var convertedImage = new Image();
			convertedImage.src = canvas.toDataURL('image/png');

			return convertedImage;

		},

		renderText: function(entity) {

			var pos = entity.getPosition();
			this.drawText(entity.text, pos.x, pos.y, entity.font, null);

		},

		renderGrid: function(tile) {

			if (typeof tile !== 'number') return;

			for (var x = 0, maxX = Math.round(this.__width / tile); x < maxX; x++) {
				for (var y = 0, maxY = Math.round(this.__height / tile); y < maxY; y++) {

					this.drawBox(
						x * tile - tile / 2,
						y * tile - tile / 2,
						(x + 1) * tile - tile /2,
						(y + 1) * tile - tile /2,
						'#f00'
					);

				}
			}

		},

		renderEntity: function(entity) {

			if (entity instanceof game.entity.Building) {

				this.renderBuilding(entity);

			} else if (entity instanceof game.entity.Unit) {

				this.renderUnit(entity);

			}

		},

		renderEntityInfo: function(entity) {

			var pos = entity.getPosition();

			var realX = pos.x + this.__offset.x;
			var realY = pos.y + this.__offset.y;

			if (
				realX > 0 && realX < this.__width
				&& realY > 0 && realY < this.__height
			) {

				var sw = entity.sprite.height;

				this.drawBox(
					realX - sw / 2,
					realY - sw / 2,
					realX + sw / 2,
					realY + sw / 2,
					'white'
				);

			}

		},

		renderBuilding: function(entity) {

			var pos = entity.getPosition();

			var realX = pos.x + this.__offset.x;
			var realY = pos.y + this.__offset.y;

			if (
				realX > 0 && realX < this.__width
				&& realY > 0 && realY < this.__height
			) {

				var state = entity.getState();
				var buildingMap = entity.getMap(state);

				var sw = entity.sprite.height;


				this.drawSprite(
					entity.sprite,
					realX - sw / 2,
					realY - sw / 2,
					buildingMap
				);

			}

		},

		renderUnit: function(entity) {

			var pos = entity.getPosition();

			var realX = pos.x + this.__offset.x;
			var realY = pos.y + this.__offset.y;

			if (
				realX > 0 && realX < this.__width
				&& realY > 0 && realY < this.__height
			) {

				var unitMap = entity.getMap('default');

				var sw = entity.sprite.height;

				this.drawSprite(
					entity.sprite,
					realX - sw / 2,
					realY - sw / 2,
					unitMap
				);


				var cannon = entity.getState('cannon');
				if (cannon !== null) {

					var cannonMap = entity.getMap('cannon');
					this.drawSprite(
						entity.sprite,
						realX - sw / 2,
						realY - sw / 2,
						cannonMap
					);

				}

			}

		}

	};


	return Class;

});

