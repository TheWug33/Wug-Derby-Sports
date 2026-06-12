export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const response = await fetch(
    "https://v3.football.api-sports.io/fixtures?league=1&season=2026",
    { headers: { "x-apisports-key": process.env.REACT_APP_FOOTBALL_API_KEY } }
  );
  const data = await response.json();
  res.json(data);
}
