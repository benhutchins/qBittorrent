(function () {
	function supportsRange() {
		var i = document.createElement('input');
		i.type = 'range';
		return i.type !== 'text';
	}

	MochaUI.extend({
		// direction can be "Up" or "Dl""
		// hash is either "global" or torrent hash identifier
		setupSlider: function (direction, hash) {
			// Get global rate limit
			new Request({
				url: 'command/getGlobal' + direction + 'Limit',
				method: 'post',
				onSuccess: function (data) {
					// get the global maximum, defaulting to 0 (infinite)
					var maximum = data ? parseInt(data, 10) : 0;
					if (maximum > 0) {
						maximum = Math.ceil(maximum / 1024);
					}

					if (hash == 'global') {
						var limit = Number.max(0, maximum);
						maximum = direction === 'Up' ? 1000 : 10000;

						if (supportsRange()) {
							new Element('input', {
								type: 'range',
								min: 0,
								max: maximum,
								step: 10,
								value: Math.round(limit / 1024)
							}).addEvent('change', function () {
								var pos = this.get('value');
								$('limitValue').set('value', pos > 0 ? pos + ' _(KiB/s)' : '∞');
							});
						}

						// Set default value
						$('limitValue').set('value', limit === 0 ? '∞' : Math.round(limit / 1024) + ' _(KiB/s)');
					}
					// Get torrent upload limit
					else {
						new Request({
							url: 'command/getTorrent' + direction + 'Limit',
							method: 'post',
							data: {
								hash: hash
							},
							onSuccess: function(data) {
								var limit = data ? Math.max(0, parseInt(data, 10)) : 0;

								if (supportsRange()) {
									var range = new Element('input', {
										type: 'range',
										min: 0,
										max: maximum === 0 ? (direction === 'Up' ? 1000 : 10000) : maximum,
										step: 10,
										value: Math.round(limit / 1024)
									}).addEvent('change', function (event) {
										var pos = this.get('value');
										$('limitValue').set('value', pos > 0 ? pos + ' _(KiB/s)' : '∞');
									});

									$$('.sliderWrapper').adopt(range);
								}

								// Set default value
								$('limitValue').set('value', limit === 0 ? '∞' : Math.round(limit / 1024) + ' _(KiB/s)');
							}
						}).send();
					}
				}
			}).send();
		}
	});
})();