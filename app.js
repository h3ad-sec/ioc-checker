async function checkIOC() {
    const ioc = document.getElementById("ioc").value;
    const output = document.getElementById("output");

    output.innerText = "Checking...";

    const res = await fetch("https://YOUR-VERCEL-APP/api/check?ioc=" + ioc);
    const data = await res.json();

    output.innerText = JSON.stringify(data, null, 2);
}