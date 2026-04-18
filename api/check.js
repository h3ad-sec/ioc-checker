export default async function handler(req, res) {
  const ioc = req.query.ioc;

  if (!ioc) {
    return res.status(400).json({ error: "IOC missing" });
  }

  const result = {
    ioc,
    timestamp: new Date().toISOString(),
    sources: {}
  };

  try {
    // -------------------------
    // OTX (no key required)
    // -------------------------
    const otxRes = await fetch(
      `https://otx.alienvault.com/api/v1/indicators/IPv4/${ioc}/general`
    );
    result.sources.otx = await otxRes.json();

    // -------------------------
    // AbuseIPDB (optional key)
    // -------------------------
    if (process.env.ABUSE_KEY) {
      const abuseRes = await fetch(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${ioc}`,
        {
          headers: {
            Key: process.env.ABUSE_KEY,
            Accept: "application/json"
          }
        }
      );
      result.sources.abuseipdb = await abuseRes.json();
    }

    // -------------------------
    // VirusTotal (optional key)
    // -------------------------
    if (process.env.VT_KEY) {
      const vtRes = await fetch(
        `https://www.virustotal.com/api/v3/ip_addresses/${ioc}`,
        {
          headers: {
            "x-apikey": process.env.VT_KEY
          }
        }
      );
      result.sources.virustotal = await vtRes.json();
    }

    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch IOC data",
      details: err.message
    });
  }
}
