if (Categories.find().count() === 0) {
	Categories.insert({
		name: 'Museums'
	});
	Categories.insert({
		name: 'Japanese',
	});
	Categories.insert({
		name: 'Packaging and Shipping',
	});
}

// Kite, Bike, Running, Sailing, Book reading weather
//

// Raw Weather Parameter Features used to construct legos
// TODO: add programatic definitions based on the Weather API
// https://openweathermap.org/current
if (WeatherFeatures.find().count() === 0) {
  WeatherFeatures.insert({
    name: 'temperature',
    description: 'Temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.',
  });

  WeatherFeatures.insert({
    name: 'wind speed',
    description: 'Wind speed. Unit Default: meter/sec, Metric: meter/sec, Imperial: miles/hour.'
  });

  WeatherFeatures.insert({
    name: 'rain volume',
    description: 'Rain volume for the last 3 hours'
  })
}

if (MovementFeatures.find().count() === 0) {
  MovementFeatures.insert({
    name: "speed",
    description: "Speed of user given by the change in their mobile phone GPS location. Units of mph"
  });

  MovementFeatures.insert({
    name: "period-of-accelerometer",
    description: "If there is any periodic patterns in a mobile user's \
    accelerometer data, the value of this parameter will tell you the \
    length of that period."
  })
}

