
lychee.define('game.Jukebox').includes([
	'lychee.game.Jukebox'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.Jukebox.call(this, 20, game.loop);

		this.game = game;

		var base = game.settings.base;
		var formats = [ 'mp3', 'ogg', 'gsm', 'amr' ];

		var tracks = [
			// 'music',
			'sound/click',
			'music/act-on-instinct',
			'music/just-do-it',
			'music/menu'
		];


		for (var t = 0, l = tracks.length; t < l; t++) {

			var track = new lychee.Track(tracks[t], {
				base: base + '/' + tracks[t],
				formats: formats
			});

			this.add(track);

		}

	};

	Class.prototype = {

		playMusic: function(id) {
			if (this.game.settings.music === false) return;
			this.fadeIn('music/' + id, 2000, true);
		},

		stopMusic: function(id) {
			this.fadeOut('music/' + id, 2000, true);
		},

		playSound: function(id) {
			if (this.game.settings.sound === false) return;
			this.play('sound/' + id);
		}

	};


	return Class;

});

