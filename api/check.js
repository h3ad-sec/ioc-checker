const API = "https://YOUR-VERCEL-URL.vercel.app/api/check";

async function run() {

  const input = document.getElementById("input").value;

  const res = await fetch(
    `${API}?ioc=${encodeURIComponent(input)}`
  );

  const data = await res.json();

  render(data.results);
}

function render(results) {
  const table = document.getElementById("table");
  table.innerHTML = "";

  results.forEach(r => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${r.ioc}</td>
      <td>${r.type}</td>
      <td>${r.score}</td>
      <td style="color:${color(r.severity)}">${r.severity}</td>
    `;

    table.appendChild(row);
  });
}

function color(sev) {
  if (sev === "HIGH") return "red";
  if (sev === "MEDIUM") return "orange";
  return "green";
}
