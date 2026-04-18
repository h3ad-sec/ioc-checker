export default async function handler(req, res) {

  const result = {
    vt_key_exists: !!process.env.VT_KEY,
    abuse_key_exists: !!process.env.ABUSE_KEY
  };

  res.status(200).json(result);
}
