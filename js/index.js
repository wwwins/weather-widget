$(document).ready(function() {
	var enable_my_info = true;
	var checking_time = 1000 * 60 * 5;
	var my_id = 353607;
	var currentDate,
			currentLocation = 'taipei',
			currentTemp = [],
			currentUnits = 'c', // Default to C
			forecast = [],
			$forecastDivs = $('#future .container'),
			$locateBtn = $('#locateBtn'),
			$unitBtn = $('#unitBtn');

	// ---------------
	// Weather API
	// ---------------

	function getMyWeather() {
			$.ajax({
					method: 'GET',
					dataType: 'json',
					url: 'http://weather.tp.edu.tw/Ajax/jsonp/LastAllEffect.ashx'
			}).done(
					function(data) {
							data.result.forEach(
									function(r) {
											if (r.Id == my_id)
													var myName = r.SchoolName;
											var myTempe = r.Tempe;
											$('#current .location').html(myName);
											$('#current .temp').html(myTempe);
									}
							)
					}
			);
	}

	// Send request to API to get weather data
	function getWeather(location) {
			var weatherRequest = $.ajax({
					method: 'GET',
					url: '//api.wunderground.com/api/d6fadca18738e4ec/geolookup/conditions/forecast/q/' + location + '.json'
			});
			// If getting was successful, send data to be processed
			weatherRequest.done(function(data) {
					processData(data);
					if (enable_my_info) getMyWeather();
			});
			// If request fails, show error
			weatherRequest.fail(function(xhr, status, error) {
					console.warn(error.message);
			});
	}

	// Grab only the needed info from weather request and return
	function processData(data) {
			var current = data.current_observation;
			var daily = data.forecast.simpleforecast.forecastday;
			// Store values for current date, location, and temp
			currentDate = daily[0].date.weekday + ', ' + daily[0].date.monthname + ' ' + daily[0].date.day + ', ' + daily[0].date.year;
			currentLocation = current.display_location.city + ', ' + current.display_location.state;
			currentTemp = {
					c: current.temp_c,
					f: current.temp_f
			};
			forecast.length = 0; // Empty array first
			// Store forecast info
			daily.forEach(function(day) {
					var obj = {}; // Temporary object
					obj.weekdayShort = day.date.weekday_short;
					obj.conditions = day.conditions;
					obj.icon = day.icon;
					obj.c = {
							high: day.high.celsius,
							low: day.low.celsius
					};
					obj.f = {
							high: day.high.fahrenheit,
							low: day.low.fahrenheit
					};
					forecast.push(obj);
			});
			// Display weather ONLY after processing
			displayWeather();
	}

	// Display data on page
	function displayWeather() {
			// Separate today's forecast from the rest
			var today = forecast.shift();
			// Today - Print weather data
			if (!enable_my_info) $('#current .location').html(currentLocation);
			$('#current .date').html(currentDate);
			$('#current .weatherIcon > i').attr('class', 'fa-5x wi wi-wu-' + today.icon);
			$('#current .conditions').html(today.conditions);
			$('#lastUpdated').html('Last updated at ' + getCurrentTime());
			// Add forecast data to page, don't display temps yet
			$forecastDivs.each(function(index) {
					$(this).find('.day').html(forecast[index].weekdayShort);
					$(this).find('.weatherIcon').children().attr('class', 'fa-5x wi wi-wu-' + forecast[index].icon);
					$(this).find('.conditions').html(forecast[index].conditions);
			});
			// Get/update temps with current units
			updateTemps(currentUnits);
	}

	// Update temps and add to page
	function updateTemps(units) {
			if (!enable_my_info) $('#current .temp').html(Math.round(currentTemp[units]));
			$forecastDivs.each(function(index) {
					$(this).find('.high').html(forecast[index][units].high);
					$(this).find('.low').html(forecast[index][units].low);
			});
	}

	// ---------------
	// Misc Functions
	// ---------------

	// Get and format current time
	function getCurrentTime() {
			var now = new Date();
			var hours = now.getHours();
			var mins = now.getMinutes();
			var period = 'am';
			if (hours > 11) {
					period = 'pm';
					if (hours > 12) hours -= 12; // Format for 12-hr clock
			}
			if (mins < 10) {
					mins = '0' + mins; // Format minutes
			}
			return hours + ':' + mins + period;
	}

	// ------------------------
	// Buttons
	// ------------------------

	// unitBtn - click to toggle units
	$unitBtn.on('click', function() {
			$(this).toggleClass('on')
					.attr('data-units', $(this).attr('data-units') === 'f' ? 'c' : 'f');
			currentUnits = $(this).attr('data-units');
			$(this).html(currentUnits);
			updateTemps(currentUnits);
	});

	// ------------------------
	// Functions to run onload
	// ------------------------ 
	window.onload = function() {
			getWeather(currentLocation);
			setInterval(function() {
					getWeather(currentLocation);
			}, checking_time);
	};
});