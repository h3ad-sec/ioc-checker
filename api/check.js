export default function handler(req, res) {
  res.status(200).json({
    status: "IOC API WORKING",
    time: new Date().toISOString()
  });
}
