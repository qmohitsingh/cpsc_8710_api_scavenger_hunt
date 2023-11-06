# API Integration with Node.js and Express

In this project, we have created a web server using Node.js and the Express framework to explore and interact with various APIs. Node.js provides a robust and scalable environment for building server-side applications, and Express simplifies the routing and middleware integration, creating a seamless development experience.

## Introduction

Our server is configured to handle various API integrations, providing endpoints that interact with external services to fetch and serve data. We have utilized popular libraries such as `axios` for making HTTP requests and `morgan` for logging HTTP requests details, enhancing the development and debugging process.

Throughout this documentation, we will walk through different tasks, each focusing on interacting with a specific API. We will cover the setup, the code implementation, and provide reflections on the experience of using each API.

Our objective is to demonstrate how to integrate external APIs into a Node.js and Express application, showcase the potential capabilities, and discuss the ease of use and applications of each API.

Let's dive into the tasks and explore the world of APIs!

# Integration of Diverse APIs

This project explores the seamless integration of multiple APIs to deliver a suite of services including weather forecasting, currency exchange, comprehensive country data retrieval, and mapping functionalities.

## Task 1: Weather Data

### Current Weather Data and 5-Day Weather Forecast

We have two endpoints that provide weather information using the OpenWeatherMap API.

```javascript
app.get('/currentWeather/:city/:country', async (req, res) => {
    try {
        const { city, country } = req.params;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=metric&appid=${apiKey}`;
        const response = await axios.get(url);
        const weatherData = response.data;

        res.json({
            location: `${city}, ${country}`,
            description: weatherData.weather[0].description,
            temperature: `${weatherData.main.temp}°C`,
            feels_like: `${weatherData.main.feels_like}°C`,
            humidity: `${weatherData.main.humidity}%`,
            wind_speed: `${weatherData.wind.speed} m/s`,
            sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
            sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()
        });
    } catch (error) {
        console.error('Error retrieving current weather', error);
        res.status(500).send('Error retrieving current weather');
    }
});


app.get('/forecast/:city/:country', async (req, res) => {
    try {
        const { city, country } = req.params;
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&units=metric&appid=${apiKey}`;
        const response = await axios.get(url);

        const forecast = response.data.list.map((entry) => ({
            date: new Date(entry.dt * 1000).toLocaleDateString(),
            time: new Date(entry.dt * 1000).toLocaleTimeString(),
            temperature: `${entry.main.temp}°C`,
            feels_like: `${entry.main.feels_like}°C`,
            main: entry.weather[0].main,
            description: entry.weather[0].description,
            wind_speed: `${entry.wind.speed} m/s`,
            humidity: `${entry.main.humidity}%`
        }));

        res.json({
            location: `${city}, ${country}`,
            forecast: forecast
        });
    } catch (error) {
        console.error('Error retrieving 5-day forecast', error);
        res.status(500).send('Error retrieving 5-day forecast');
    }
});

```

### Results and Screenshots

#### Current Weather in London, United Kingdom

Here's the result of retrieving the current weather data for London, United Kingdom:

![Current Weather in London](img/current-weather.png)

#### 5-Day Weather Forecast in Tokyo, Japan

And here is the 5-day weather forecast for Tokyo, Japan:

![5-Day Weather Forecast in Tokyo](img/forecast-tokyo-jp.png)


### Reflection:
The OpenWeather API provides a straightforward way to access current weather data. It offers a variety of weather-related information, including temperature, humidity, wind speed, and weather conditions. The API requires an API key for access, which you should store securely using environment variables. The documentation is well-structured, making it easy to find the required endpoints and understand how to use them. However, there are rate limits on free plans, so it's important to consider this if you're planning to make frequent requests.
Also, processing this large amount of data can be challenging, and you might need to implement additional logic to summarize or filter the information according to your application’s needs

## Task 2: Country Information

### Country Information Retrieval

This endpoint retrieves information about a specific country using the RestCountries API.

```javascript
// Endpoint to retrieve information about a specific country
app.get('/country/:countryName', async (req, res) => {
    const { countryName } = req.params;
    try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
        const country = response.data[0];
        const countryInfo = {
            countryName: country.name.common, // Adding the common country name
            capitalCity: country.capital ? country.capital[0] : 'Not Available', // Adding the capital city
            population: country.population.toLocaleString(), // Formatting the population for readability
            area: `${country.area.toLocaleString()} km²`, // Adding units to the area
            officialLanguage: country.languages ? Object.values(country.languages).join(', ') : 'Not Available', // Joining all official languages if multiple
            currencies: country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : 'Not Available', // Adding currency information
            region: country.region, // Including the region
            subregion: country.subregion ? country.subregion : 'Not Available', // Including the subregion if available
            flag: country.flags.svg ? country.flags.svg : 'Not Available' // Providing the URL to the country's flag
        };
        res.json(countryInfo);
    } catch (error) {
        console.error(`Error retrieving information about ${countryName}:`, error);
        res.status(500).send(`Error retrieving information about ${countryName}`);
    }
});

// Endpoint to retrieve a list of all countries in a specific continent
app.get('/continent/:continentName', async (req, res) => {
    const { continentName } = req.params;
    try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countriesInContinent = response.data
            .filter(country => country.region?.toLowerCase() === continentName.toLowerCase())
            .map(country => ({
                countryName: country.name.common,
                capitalCity: country.capital ? country.capital[0] : 'Not Available',
                population: country.population.toLocaleString(),
                area: country.area ? `${country.area.toLocaleString()} km²` : 'Not Available',
                languages: country.languages ? Object.values(country.languages).join(', ') : 'Not Available',
                flag: country.flags.svg ? country.flags.svg : 'Not Available'
            }));

        res.json({
            continent: continentName.charAt(0).toUpperCase() + continentName.slice(1).toLowerCase(),
            numberOfCountries: countriesInContinent.length,
            countries: countriesInContinent
        });
    } catch (error) {
        console.error(`Error retrieving list of countries in ${continentName}:`, error);
        res.status(500).send(`Error retrieving list of countries in ${continentName}`);
    }
});

```

### Results and Screenshots

#### Retrieve information about Brazil, including its population, area, and official language

Here are the details retrieved for Brazil, including its population, area, and official language:

![Information about Brazil](img/country-brazil.png)

#### Retrieve a list of all countries in Africa

And here is the list showing all the countries in Africa along with some details:

![Information about Africa](img/continent-africa.png)


### Reflection: 
The REST Countries API is a gem for developers looking for simplicity and efficiency. 
Without the need for an API key, it offers hassle-free access to a wealth of information about countries around the world. 
The API returns data in a clean, easy-to-parse format, which is perfect for educational apps, travel guides, or any platform that benefits from cultural and geographical awareness. 
Its simplicity in fetching country-specific data like population, languages, and area makes it highly accessible for developers of all skill levels.

### Task 3: Map Services
### Google Maps Integration
We have integrated Google Maps to provide map services and route calculations.

### Map Display
To display a map, you can use the following endpoint:

```javascript
app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

```

```html
<!-- map.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Google Maps: New York City</title>
    <script>
        async function fetchApiKey() {
            const response = await fetch('/api/maps-api-key');
            const data = await response.json();
            return data.apiKey;
        }

        async function initMap() {
            const apiKey = await fetchApiKey();
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=loadMap`;
            script.defer = true;
            document.head.appendChild(script);
        }

        function loadMap() {
            var nyc = {lat: 40.7128, lng: -74.0060};
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: nyc
            });
            var marker = new google.maps.Marker({
                position: nyc,
                map: map
            });
        }
    </script>
    <style>
        #map {
            height: 100vh;
            width: 100%;
        }
    </style>
</head>
<body onload="initMap()">
<div id="map"></div>
</body>
</html>

```

### Shortest Route Calculation
To calculate the shortest route between two locations, you can use this endpoint:
```javascript
app.get('/map/shortest-route', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shortest_route.html'));
});

app.get('/api/maps-api-key', (req, res) => {
    res.json({ apiKey: googleMapsApiKey });
});

```

```html
<!-- shortest_route.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Google Maps: Route Finder</title>
    <script>
        async function fetchApiKey() {
            const response = await fetch('/api/maps-api-key');
            const data = await response.json();
            return data.apiKey;
        }

        async function initMap() {
            const apiKey = await fetchApiKey();
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=loadMap&libraries=places`;
            script.defer = true;
            document.head.appendChild(script);
        }

        function loadMap() {
            var sanFrancisco = new google.maps.LatLng(37.7749, -122.4194);
            var losAngeles = new google.maps.LatLng(34.0522, -118.2437);

            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 6,
                center: sanFrancisco
            });

            var directionsService = new google.maps.DirectionsService();
            var directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);
            directionsRenderer.setPanel(document.getElementById('directions-panel'));

            var request = {
                origin: sanFrancisco,
                destination: losAngeles,
                travelMode: 'DRIVING'
            };

            directionsService.route(request, function(result, status) {
                if (status == 'OK') {
                    directionsRenderer.setDirections(result);
                }
            });
        }
    </script>
    <style>
        #map {
            height: 50vh;
            width: 100%;
        }
        #directions-panel {
            height: 50vh;
            overflow: auto;
        }
    </style>
</head>
<body onload="initMap()">
<div id="map"></div>
<div id="directions-panel"></div>
</body>
</html>

```

### Results and Screenshots

#### Display a map centered on New York City, USA

Here's the result of displaying a map centered on New York City, USA:

![displaying a map centered on New York City, USA](img/centered-on-ny.png)

#### Calculation of the shortest route between two locations

And here is the result of finding the shortest route by car between San Francisco, USA, and Los Angeles, USA

![the shortest route by car between San Francisco, USA, and Los Angeles, USA 1](img/shortest-route.png)
![the shortest route by car between San Francisco, USA, and Los Angeles, USA 2](img/shortest-route-2.png)


### Reflection:
Google Maps API stands out for its comprehensive suite of features that allow for map rendering, route planning, and location-based searches. 
While the feature set is vast, getting started can be more involved due to the complexity of the API and the number of features available. 
However, once set up, it's highly reliable and accurate. 
The potential applications are nearly limitless, ranging from navigation and travel services to real estate and urban planning tools. 
The API's ability to provide detailed directions and travel times is particularly beneficial for logistics and transportation services.

## Task 4: Currency Conversion
### Currency Conversion Services
These endpoints perform currency conversion using the Currency Converter API.

```javascript

// Endpoint to convert an amount from USD to EUR

app.get('/convert/usd-to-eur', async (req, res) => {
    const amountUSD = req.query.amount;
    if (!amountUSD) {
        return res.status(400).send('Please provide an amount to convert.');
    }

    try {
        const response = await axios.get(`https://free.currconv.com/api/v7/convert?q=USD_EUR&compact=ultra&apiKey=${currencyConverterApiKey}`);
        const conversionRate = response.data.USD_EUR;
        const convertedAmount = (amountUSD * conversionRate).toFixed(2);
        res.json({
            fromCurrency: 'USD',
            toCurrency: 'EUR',
            originalAmount: `${amountUSD} USD`,
            convertedAmount: `${convertedAmount} EUR`,
            conversionRate: conversionRate
        });
    } catch (error) {
        console.error('Error converting USD to EUR:', error);
        res.status(500).send('Error converting USD to EUR');
    }
});

// Endpoint to convert an amount from JPY to GBP
app.get('/convert/jpy-to-gbp', async (req, res) => {
    const amountJPY = req.query.amount;
    if (!amountJPY) {
        return res.status(400).send('Please provide an amount to convert.');
    }

    try {
        const response = await axios.get(`https://free.currconv.com/api/v7/convert?q=JPY_GBP&compact=ultra&apiKey=${currencyConverterApiKey}`);
        const conversionRate = response.data.JPY_GBP;
        const convertedAmount = (amountJPY * conversionRate).toFixed(2);
        res.json({
            fromCurrency: 'JPY',
            toCurrency: 'GBP',
            originalAmount: `${amountJPY} JPY`,
            convertedAmount: `${convertedAmount} GBP`,
            conversionRate: conversionRate
        });
    } catch (error) {
        console.error('Error converting JPY to GBP:', error);
        res.status(500).send('Error converting JPY to GBP');
    }
});

```

### Results and Screenshots

#### Currency Conversion from USD to EUR

Here's the result of converting an amount from USD to EUR

![USD TO EUR](img/usd-to-eur.png)

#### Currency Conversion from JPY to GBP

And here is to converting an amount from JPY to GBP:

![JPY TO GBP](img/jpy-to-gbp.png)

### Reflection: 
The Currency Converter API provides a straightforward solution to currency conversion needs. 
With easy-to-follow documentation and a simple request structure, the API facilitates real-time access to exchange rates and currency conversions. 
This API is invaluable for financial services, e-commerce sites, and businesses with international markets. 
Its ability to perform currency calculations rapidly and with up-to-date rates ensures that financial applications provide users with accurate and timely information.

## Source Code

The source code for this project is available on GitHub:

- [GitHub Repository: cpsc_8710_api_scavenger_hunt](https://github.com/qmohitsingh/cpsc_8710_api_scavenger_hunt)

Feel free to fork the repository, examine the code, and contribute to the development.

## License

This project is made available under the MIT License. This license allows for free use, modification, and distribution, both commercially and privately, with the only requirement being to include the original copyright and license notice in any copy of the project or substantial portions of it.

For more details, see the [LICENSE](https://github.com/qmohitsingh/cpsc_8710_api_scavenger_hunt/blob/main/LICENSE) file in the repository.

