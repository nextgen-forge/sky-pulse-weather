const API = window.location.origin;
let isCelsius = true;
let currentWeather = null;

// ===== INIT =====
window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  const city = params.get("city");
  if (city) {
    document.getElementById("cityInput").value = city;
    search();
  }
  loadHistory();
  // Ensure loader is hidden on startup
  showLoader(false);
};

// ===== SEARCH =====
async function search() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return showError("Please enter a city name.");

  showLoader(true);
  hideError();

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`${API}/weather/${encodeURIComponent(city)}`),
      fetch(`${API}/forecast/${encodeURIComponent(city)}`)
    ]);

    if (!weatherRes.ok) {
      const err = await weatherRes.json();
      throw new Error(err.detail || "City not found.");
    }

    const weather = await weatherRes.json();
    const forecast = forecastRes.ok ? await forecastRes.json() : null;

    currentWeather = weather;
    renderCurrent(weather);
    if (forecast) renderForecast(forecast.forecast);
    loadHistory();

    document.getElementById("results").classList.remove("hidden");
    setTimeout(() => {
      document.getElementById("results").scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    // Update URL to be shareable
    const url = new URL(window.location);
    url.searchParams.set("city", weather.city);
    window.history.replaceState({}, "", url);

  } catch (e) {
    showError(e.message || "Something went wrong. Check your API key in .env file.");
  } finally {
    showLoader(false);
  }
}

// ===== RENDER CURRENT =====
function renderCurrent(w) {
  document.getElementById("cityName").textContent = w.city;
  document.getElementById("cityCountry").textContent = `${w.country} · Updated just now`;
  document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
  document.getElementById("weatherIcon").alt = w.description;
  document.getElementById("description").textContent = w.description;

  updateTemps(w);
}

function updateTemps(w) {
  if (!w) return;
  const t = isCelsius ? w.temp : toF(w.temp);
  const fl = isCelsius ? w.feels_like : toF(w.feels_like);
  const unit = isCelsius ? "°C" : "°F";

  document.getElementById("tempBig").textContent = `${Math.round(t)}${unit}`;
  document.getElementById("feelsLike").textContent = `${Math.round(fl)}${unit}`;
  document.getElementById("humidity").textContent = `${w.humidity}%`;
  document.getElementById("wind").textContent = `${w.wind_speed} m/s`;
  document.getElementById("sunrise").textContent = formatTime(w.sunrise);
  document.getElementById("sunset").textContent = formatTime(w.sunset);
}

// ===== RENDER FORECAST =====
function renderForecast(days) {
  const unit = isCelsius ? "°C" : "°F";
  const grid = document.getElementById("forecastGrid");
  const today = new Date().toISOString().split("T")[0];

  grid.innerHTML = days.map((d, i) => {
    const maxT = isCelsius ? d.max_temp : toF(d.max_temp);
    const minT = isCelsius ? d.min_temp : toF(d.min_temp);
    const isToday = d.date === today || i === 0;
    return `
      <div class="day-card ${isToday ? "today" : ""}">
        <div class="day-name">${isToday ? "Today" : d.day_name.slice(0, 3)}</div>
        <img class="day-icon" src="https://openweathermap.org/img/wn/${d.icon}@2x.png" alt="${d.description}"/>
        <div class="day-desc">${d.description}</div>
        <div class="day-temps">
          ${Math.round(maxT)}${unit}
          <span class="day-min"> / ${Math.round(minT)}${unit}</span>
        </div>
        <div class="day-humidity">💧 ${d.humidity}%</div>
      </div>
    `;
  }).join("");
}

// ===== LOAD HISTORY =====
async function loadHistory() {
  try {
    const res = await fetch(`${API}/history`);
    const records = await res.json();
    const list = document.getElementById("historyList");

    if (!records.length) {
      list.innerHTML = `<span class="history-empty">No recent searches yet.</span>`;
      return;
    }

    const seen = new Set();
    const unique = records.filter(r => {
      if (seen.has(r.city)) return false;
      seen.add(r.city); return true;
    });

    list.innerHTML = unique.map(r => `
      <div class="history-chip" onclick="searchCity('${r.city}')">
        <span>📍 ${r.city}</span>
        <span class="chip-temp">${Math.round(isCelsius ? r.temp : toF(r.temp))}${isCelsius ? "°C" : "°F"}</span>
      </div>
    `).join("");
  } catch {}
}

async function clearHistory() {
  await fetch(`${API}/history`, { method: "DELETE" });
  loadHistory();
  showToast("History cleared");
}

function searchCity(city) {
  document.getElementById("cityInput").value = city;
  search();
}

// ===== GEOLOCATION =====
function geoLocate() {
  if (!navigator.geolocation) return showError("Geolocation not supported in your browser.");
  showToast("Detecting your location…");
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await res.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.county;
      if (city) {
        document.getElementById("cityInput").value = city;
        search();
      } else {
        showError("Could not detect your city. Try searching manually.");
      }
    } catch {
      showError("Location lookup failed. Try searching manually.");
    }
  }, () => showError("Location access denied. Please allow location permission."));
}

// ===== UNIT TOGGLE =====
function toggleUnit() {
  isCelsius = !isCelsius;
  document.getElementById("unitToggle").textContent = isCelsius ? "°C / °F" : "°F / °C";
  if (currentWeather) updateTemps(currentWeather);
  const days = document.querySelectorAll(".day-card");
  if (days.length > 0 && currentWeather) {
    fetch(`${API}/forecast/${encodeURIComponent(currentWeather.city)}`)
      .then(r => r.json())
      .then(d => renderForecast(d.forecast))
      .catch(() => {});
  }
  loadHistory();
}

// ===== THEME TOGGLE =====
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", isDark ? "light" : "dark");
  document.getElementById("themeIcon").textContent = isDark ? "🌙" : "☀️";
}

// ===== SHARE =====
function shareWeather() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: "SkyPulse Weather", url });
  } else {
    navigator.clipboard.writeText(url).then(() => showToast("🔗 Link copied to clipboard!"));
  }
}

// ===== HELPERS =====
function toF(c) { return c * 9 / 5 + 32; }

function formatTime(unix) {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function showError(msg) {
  const box = document.getElementById("errorBox");
  box.textContent = "⚠️ " + msg;
  box.classList.remove("hidden");
}

function hideError() {
  document.getElementById("errorBox").classList.add("hidden");
}

function showLoader(show) {
  document.getElementById("loader").classList.toggle("hidden", !show);
  if (show) document.getElementById("results").classList.add("hidden");
}

function showToast(msg) {
  let toast = document.getElementById("globalToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "globalToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}
