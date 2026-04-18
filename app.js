const API = "https://ioc-checker.vercel.app/api/check";

async function run() {
  const file = document.getElementById("fileInput").files[0];
  const manual = document.getElementById("manualInput").value;

  let iocs = [];

  // ---------------- FILE INPUT ----------------
  if (file) {
    const text = await file.text();
    iocs = text
      .replace(/\n/g, ",")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
  }

  // ---------------- MANUAL INPUT ----------------
  if (manual) {
    iocs = manual.split(",").map(x => x.trim());
  }

  const res = await fetch(`${API}?ioc=${encodeURIComponent(iocs.join(","))}`);
  const data = await res.json();

  render(data.results);
}

function render(results) {
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  results.forEach(r => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${r.ioc}</td>
      <td>${r.type}</td>
      <td>${r.score}</td>
      <td style="color:${color(r.severity)}">${r.severity}</td>
    `;

    tbody.appendChild(row);
  });
}

function color(sev) {
  if (sev === "HIGH") return "red";
  if (sev === "MEDIUM") return "orange";
  return "green";
}
