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

    // ---------------- OTX ----------------
    const otxRes = await fetch(
      `https://otx.alienvault.com/api/v1/indicators/IPv4/${ioc}/general`
    );
    result.sources.otx = await otxRes.json();

    // ---------------- AbuseIPDB ----------------
    if (process.env.ABUSE_KEY) {
      const abuseRes = await fetch(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${ioc}`,
        {
          headers: {
            Key: process.env.ABUSE_KEY.trim(),
            Accept: "application/json"
          }
        }
      );

      result.sources.abuseipdb = await abuseRes.json();
    } else {
      result.sources.abuseipdb = {
        error: "ABUSE_KEY missing in environment variables"
      };
    }

    // ---------------- VirusTotal ----------------
    if (process.env.VT_KEY) {
      const vtRes = await fetch(
        `https://www.virustotal.com/api/v3/ip_addresses/${ioc}`,
        {
          headers: {
            "x-apikey": process.env.VT_KEY.trim()
          }
        }
      );

      result.sources.virustotal = await vtRes.json();
    } else {
      result.sources.virustotal = {
        error: "VT_KEY missing in environment variables"
      };
    }

    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({
      error: "Backend failure",
      details: err.message
    });
  }
}
