export default async function handler(req, res) {
  const ioc = req.query.ioc;

  const result = {
    ioc,
    sources: {}
  };

  try {
    // OTX (always works)
    const otx = await fetch(
      `https://otx.alienvault.com/api/v1/indicators/IPv4/${ioc}/general`
    );
    result.sources.otx = await otx.json();

    // AbuseIPDB (debug enabled)
    if (process.env.ABUSE_KEY) {
      try {
        const abuse = await fetch(
          `https://api.abuseipdb.com/api/v2/check?ipAddress=${ioc}`,
          {
            headers: {
              Key: process.env.ABUSE_KEY,
              Accept: "application/json"
            }
          }
        );
        result.sources.abuseipdb = await abuse.json();
      } catch (e) {
        result.sources.abuseipdb_error = e.message;
      }
    } else {
      result.sources.abuseipdb = "NO API KEY SET";
    }

    // VirusTotal (debug enabled)
    if (process.env.VT_KEY) {
      try {
        const vt = await fetch(
          `https://www.virustotal.com/api/v3/ip_addresses/${ioc}`,
          {
            headers: {
              "x-apikey": process.env.VT_KEY
            }
          }
        );
        result.sources.virustotal = await vt.json();
      } catch (e) {
        result.sources.virustotal_error = e.message;
      }
    } else {
      result.sources.virustotal = "NO API KEY SET";
    }

    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}
