const API_URL = "http://localhost:5000/api/services";

const serviceList = document.getElementById("service-list");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("empty-state");
const message = document.getElementById("message");
const form = document.getElementById("service-form");
const refreshBtn = document.getElementById("refresh-btn");
const lastUpdated = document.getElementById("last-updated");

const totalCount = document.getElementById("total-count");
const healthyCount = document.getElementById("healthy-count");
const degradedCount = document.getElementById("degraded-count");
const downCount = document.getElementById("down-count");

function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = `message show ${type}`;
  setTimeout(() => { message.className = "message"; }, 3000);
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function updateSummary(services) {
  totalCount.textContent = services.length;
  healthyCount.textContent = services.filter(s => s.status === "healthy").length;
  degradedCount.textContent = services.filter(s => s.status === "degraded").length;
  downCount.textContent = services.filter(s => s.status === "down").length;
}

function renderServices(services) {
  serviceList.innerHTML = "";
  updateSummary(services);

  if (services.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  services.forEach(service => {
    const article = document.createElement("article");
    article.className = "service-card";
    article.innerHTML = `
      <div class="service-info">
        <h3>${escapeHTML(service.name)}</h3>
        <p>Environment: ${escapeHTML(service.environment)}</p>
        <a href="${escapeHTML(service.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(service.url)}</a>
      </div>
      <span class="status ${escapeHTML(service.status)}">${escapeHTML(service.status)}</span>
      <div class="service-actions">
        <button class="delete-btn" data-id="${service._id}">Delete</button>
      </div>
    `;
    serviceList.appendChild(article);
  });
}

async function loadServices() {
  loading.style.display = "block";
  emptyState.style.display = "none";

  try {
    const response = await fetch(API_URL);
    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Failed to load services");

    renderServices(result.data);
    lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    console.error(error);
    showMessage("Could not connect to the backend.", "error");
  } finally {
    loading.style.display = "none";
  }
}

async function createService(service) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(service)
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to create service");
  return result;
}

async function deleteService(id) {
  if (!confirm("Delete this service from the inventory?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Failed to delete service");

    showMessage("Service deleted successfully.");
    await loadServices();
  } catch (error) {
    console.error(error);
    showMessage(error.message, "error");
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const service = {
    name: document.getElementById("name").value.trim(),
    environment: document.getElementById("environment").value.trim(),
    url: document.getElementById("url").value.trim(),
    status: document.getElementById("status").value
  };

  try {
    await createService(service);
    form.reset();
    showMessage("Service registered successfully.");
    await loadServices();
  } catch (error) {
    console.error(error);
    showMessage(error.message, "error");
  }
});

serviceList.addEventListener("click", event => {
  if (event.target.classList.contains("delete-btn")) {
    deleteService(event.target.dataset.id);
  }
});

refreshBtn.addEventListener("click", loadServices);

loadServices();
