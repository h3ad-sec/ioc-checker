export default async function handler(req, res) {
  let iocs = [];

  // Accept CSV / comma / array
  const raw = req.query.ioc || "";

  if (Array.isArray(raw)) {
    iocs = raw;
  } else {
    iocs = raw
      .replace(/\n/g, ",")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
  }

  const results = [];

  for (const ioc of iocs) {

    const item = {
      ioc,
      type: detectType(ioc),
      score: 0,
      severity: "LOW",
      sources: {}
    };

    try {

      // OTX
      const otx = await fetch(
        `https://otx.alienvault.com/api/v1/indicators/IPv4/${ioc}/general`
      ).catch(() => null);

      if (otx) item.sources.otx = await otx.json();

      // AbuseIPDB
      const abuse = await fetch(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${ioc}`,
        {
          headers: {
            Key: process.env.ABUSE_KEY,
            Accept: "application/json"
          }
        }
      );

      const abuseData = await abuse.json();
      item.sources.abuseipdb = abuseData;

      const abuseScore = abuseData?.data?.abuseConfidenceScore || 0;

      // VirusTotal
      const vt = await fetch(
        `https://www.virustotal.com/api/v3/ip_addresses/${ioc}`,
        {
          headers: {
            "x-apikey": process.env.VT_KEY
          }
        }
      );

      const vtData = await vt.json();
      item.sources.virustotal = vtData;

      const vtMal = vtData?.data?.attributes?.last_analysis_stats?.malicious || 0;

      // ---------------- SCORE ENGINE ----------------
      item.score = abuseScore + vtMal * 10;

      if (item.score > 70) item.severity = "HIGH";
      else if (item.score > 30) item.severity = "MEDIUM";
      else item.severity = "LOW";

    } catch (e) {
      item.error = e.message;
    }

    results.push(item);
  }

  res.json({ count: results.length, results });
}

// TYPE DETECTION
function detectType(ioc) {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ioc)) return "IP";
  if (ioc.includes(".")) return "DOMAIN";
  if (ioc.length === 32) return "MD5";
  if (ioc.length === 40) return "SHA1";
  if (ioc.length === 64) return "SHA256";
  if (ioc.startsWith("http")) return "URL";
  return "UNKNOWN";
}
