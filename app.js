const API_URL = "https://ioc-checker.vercel.app/api/check";

async function checkIOC() {
  const ioc = document.getElementById("ioc").value;
  const output = document.getElementById("output");

  if (!ioc) {
    output.innerText = "Enter IOC";
    return;
  }

  output.innerText = "Analyzing IOC...";

  try {
    const res = await fetch(`${API_URL}?ioc=${ioc}`);
    const data = await res.json();

    output.innerText = JSON.stringify(data, null, 2);

  } catch (err) {
    output.innerText = "Error: " + err.message;
  }
}
