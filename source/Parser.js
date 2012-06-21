
lychee.define('game.Parser').includes([
	'lychee.Events',
]).exports(function(lychee, global) {

	var Class = function(renderer, settings) {

		lychee.Events.call(this, 'parser');

		// Required for converting images
		this.__renderer = renderer;

		this.preloader = new lychee.Preloader({
			timeout: 1000
		});

		this.settings = lychee.extend({}, this.defaults, settings);

	};


	Class.prototype = {

		defaults: {
			base: '.'
		},

		parse: function(models, levels) {

			var data = {
				models: {},
				levels: {}
			};

			this.preloader.bind('ready', function(assets) {

				this.__addSheetsToModels(data.models, assets);

				this.trigger('ready', [ data.models, data.levels ]);

			}, this);


			for (var groupId in models) {

				for (var modelId in models[groupId]) {

					var model =	models[groupId][modelId];
					model.type = groupId;
					model.id = modelId;
					model.grid = model.grid || null;

					data.models[modelId] = model;

					var url = this.settings.base + '/sheet/' + groupId.toLowerCase() + '/' + modelId.toLowerCase() + '.png';

					this.preloader.load(url);

				}

			}


			// FIXME: Deferred loading of level data
			for (var levelId in levels) {
				data.levels[levelId] = levels[levelId];
			}

		},

		__addSheetsToModels: function(models, assets) {

			for (var url in assets) {

				var tmp = url.split('/');
				var id = tmp[tmp.length - 1].split('.')[0];


				var image = assets[url];
				if (!image instanceof Image) {
					continue;
				} else {

					for (var modelId in models) {

						if (modelId.toLowerCase() === id) {
							image = this.__renderer.getConvertedImage(assets[url]);
							models[modelId].sprite = image;
							break;
						}

					}

				}

			}

		}

	};


	return Class;

});

