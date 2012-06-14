
lychee.define('game.Main').requires([
	'lychee.Font',
	'lychee.Input',
	'lychee.Preloader',
	'game.Data',
	'game.Jukebox',
	'game.Parser',
	'game.Renderer',
	'game.state.Game',
	'game.state.Menu',
	'game.DeviceSpecificHacks',
	'game.logic.Main'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		lychee.game.Main.call(this, settings);

		this.fonts = {};
		this.sprite = null;
		this.map = null;

		this.load();

	};


	Class.prototype = {

		defaults: {
			base: './asset',
			sound: true,
			music: true,
			fullscreen: false,
			renderFps: 60,
			updateFps: 60,
			width: 912,
			height: 386,
			tile: 24
		},

		load: function() {

			var base = this.settings.base;

			var urls = [
				base + '/img/font_48_white.png',
				base + '/img/font_32_white.png',
				base + '/img/font_16_white.png',
				base + '/models.json',
				base + '/levels.json'
			];


			this.preloader = new lychee.Preloader(urls, {
				timeout: 3000
			});

			this.preloader.bind('ready', function(assets) {
				this.parse(urls, assets);
			}, this);


			this.preloader.bind('error', function(urls) {
				if (lychee.debug === true) {
					console.warn('Preloader error for these urls: ', urls);
				}
			}, this);

		},

		parse: function(urls, assets) {

			var base = this.settings.base;


			this.preloader.unbind('ready');


			this.fonts.headline = new lychee.Font(assets[urls[0]], {
				kerning: 0,
				spacing: 8,
				map: [15,20,29,38,28,43,33,18,23,24,26,24,18,24,20,31,29,22,29,28,27,27,29,23,31,30,17,18,46,24,46,26,54,25,27,25,26,23,23,29,27,16,22,27,22,36,28,29,23,31,25,27,23,26,25,34,25,24,29,25,30,25,46,30,18,25,27,25,26,23,23,29,27,16,22,27,22,36,28,29,23,31,25,27,23,26,25,34,25,24,29,37,22,37,46]
			});

			this.fonts.normal = new lychee.Font(assets[urls[1]], {
				kerning: 0,
				spacing: 8,
				map: [12,15,21,28,21,30,24,14,17,18,19,18,14,18,15,23,21,17,21,21,20,20,21,18,22,22,14,14,33,18,33,20,38,19,20,19,19,18,18,21,20,13,16,20,16,26,21,21,18,22,19,20,17,20,18,24,19,18,21,18,22,18,33,22,14,19,20,19,19,18,18,21,20,13,16,20,16,26,21,21,18,22,19,20,17,20,18,24,19,18,21,26,17,26,33]
			});

			this.fonts.small = new lychee.Font(assets[urls[2]], {
				kerning: -3,
				spacing: 8,
				map: [9,11,14,17,13,18,15,10,12,12,13,12,10,12,11,14,14,11,14,13,13,13,14,12,14,14,10,10,19,12,19,13,22,12,13,12,13,12,12,14,13,9,11,13,11,16,13,14,12,14,12,13,12,13,12,15,12,12,14,12,14,12,19,14,10,12,13,12,13,12,12,14,13,9,11,13,11,16,13,14,12,14,12,13,12,13,12,15,12,12,14,16,11,16,19]
			});

			this.parser = new game.Parser(new game.Renderer(), this.settings);
			this.parser.parse(
				assets[this.settings.base + '/models.json'],
				assets[this.settings.base + '/levels.json']
			);

			this.parser.bind('ready', function(models, levels) {

				this.models = models;
				this.levels = levels;

				this.init();

			}, this);

		},

		reset: function() {

			game.DeviceSpecificHacks.call(this);


			if (this.settings.fullscreen === true) {
				this.settings.width = global.innerWidth;
				this.settings.height = global.innerHeight;
			} else {
				this.settings.width = this.defaults.width;
				this.settings.height = this.defaults.height;
			}


			this.canvas.style.width = this.settings.width + 'px';
			this.canvas.style.height = this.settings.height + 'px';

			this.renderer.reset(this.settings.width, this.settings.height, true);

			this.getOffset(true);

		},

		init: function() {

			lychee.game.Main.prototype.init.call(this);


			this.renderer = new game.Renderer(this);
			this.renderer.reset(
				this.settings.width,
				this.settings.height,
				true, { map: this.map }
			);

			var canvas = this.renderer.context;
			var wrapper = document.getElementById('game');
			wrapper.appendChild(canvas);

			this.canvas = canvas;

			this.data = new game.Data(this);
			this.jukebox = new game.Jukebox(this);
			this.logic = new game.logic.Main(this);

			this.input = new lychee.Input({
				delay: 0,
				fireModifiers: true,
				fireMove: true
			});


			this.reset();

			this.states = {
				game:    new game.state.Game(this),
				menu:    new game.state.Menu(this)
			};


			this.setState('menu');

			this.start();

		},

		getCanvas: function() {
			return this.canvas || null;
		},

		getOffset: function(reset) {

			if (this.__offset === undefined || reset === true) {
				this.__offset = {
					x: this.canvas.offsetLeft,
					y: this.canvas.offsetTop
				};
			}

			return this.__offset;

		},

		set: function(key, value) {

			if (this.settings[key] !== undefined) {

				if (value === null) {
					value = this.defaults[key];
				}

				this.settings[key] = value;

				return true;

			}

			return false;

		}

	};


	return Class;

});
