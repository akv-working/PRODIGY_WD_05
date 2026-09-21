const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const unitSelect = document.getElementById('unitSelect');
const locationBtn = document.getElementById('useLocation');
const resultContainer = document.getElementById('weatherResult');

import { API_KEY } from "./config.js";

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// enter key
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  const units = unitSelect.value;
  loadWeather(`${BASE_URL}?q=${encodeURIComponent(city)}&units=${units}&appid=${API_KEY}`, units);
});

// Geolocation 
locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  showLoading("Locating your coordinates...");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const units = unitSelect.value;
      loadWeather(`${BASE_URL}?lat=${latitude}&lon=${longitude}&units=${units}&appid=${API_KEY}`, units);
    },
    (err) => {
      console.warn("Location error:", err);
      showError("Couldn't retrieve your current location.");
    }
  );
});

// Fetchinggggg
async function loadWeather(endpoint, units) {
  showLoading("Fetching weather...");

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.cod !== 200) {
      showError(data.message ? data.message.charAt(0).toUpperCase() + data.message.slice(1) : "City not found.");
      return;
    }

    renderWeather(data, units);
  } catch (err) {
    console.error("Network error:", err);
    showError("Unable to load weather. Check your connection.");
  }
}

function renderWeather(data, units) {
  const tempUnit = units === "metric" ? "°C" : "°F";
  const speedUnit = units === "metric" ? "m/s" : "mph";

  const tempRounded = Math.round(data.main.temp);
  const condition = data.weather[0]?.description || "";

  resultContainer.innerHTML = `
    <div class="weather-info">
      <h3 class="city-name">${data.name}, ${data.sys.country}</h3>
      <div class="condition">${condition}</div>
      <div class="temp-large">${tempRounded}${tempUnit}</div>
      <div class="weather-stats">
        <span>Humidity: <strong>${data.main.humidity}%</strong></span>
        <span>Wind: <strong>${data.wind.speed} ${speedUnit}</strong></span>
      </div>
    </div>
  `;
}

function showError(message) {
  resultContainer.innerHTML = `<div class="error-msg">${message}</div>`;
}

function showLoading(message) {
  resultContainer.innerHTML = `<div class="info-msg">${message}</div>`;
}