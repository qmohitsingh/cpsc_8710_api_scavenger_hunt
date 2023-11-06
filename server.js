const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const path = require('path');

const app = express();

require('dotenv').config();

const apiKey = process.env.OPENWEATHER_API_KEY;
const currencyConverterApiKey = process.env.CURRENCY_CONVERTER_API_KEY;
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;


app.use(express.json()); // To parse JSON request bodies
app.use(morgan('dev'));  // Morgan for basic request logging

// Serve static assets
app.use(express.static('public'));

// Response Logging Middleware
app.use((req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
        console.log('Response:', body); // Log the response body
        originalSend.call(this, body);
    };

    next();
});

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


app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

app.get('/map/shortest-route', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shortest_route.html'));
});

app.get('/api/maps-api-key', (req, res) => {
    res.json({ apiKey: googleMapsApiKey });
});

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

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
