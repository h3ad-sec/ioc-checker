export default async function handler(req, res) {
    const ioc = req.query.ioc;

    if (!ioc) {
        return res.status(400).json({ error: "IOC missing" });
    }

    const result = {
        ioc: ioc,
        timestamp: new Date().toISOString(),
        sources: {}
    };

    try {

        // VirusTotal (optional API key needed)
        if (process.env.VT_KEY) {
            const vt = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ioc}`, {
                headers: { "x-apikey": process.env.VT_KEY }
            });
            result.sources.virustotal = await vt.json();
        }

        // AbuseIPDB
        if (process.env.ABUSE_KEY) {
            const abuse = await fetch(
                `https://api.abuseipdb.com/api/v2/check?ipAddress=${ioc}`,
                {
                    headers: {
                        "Key": process.env.ABUSE_KEY,
                        "Accept": "application/json"
                    }
                }
            );
            result.sources.abuseipdb = await abuse.json();
        }

        // OTX (no key needed)
        const otx = await fetch(
            `https://otx.alienvault.com/api/v1/indicators/IPv4/${ioc}/general`
        );
        result.sources.otx = await otx.json();

        res.status(200).json(result);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}