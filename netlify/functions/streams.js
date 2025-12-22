// Función serverless para Netlify
const STREAMERS = [
  "arnauz10",
  "kikoelquelon",
  "lolnezan78",
  "novaiosca",
  "azogil",
  "sitinho6",
  "sqdgiorgi",
  "tvcharliestoltes",
  "raulito21",
  "troncito999",
  "sasen82",
  "carr0quin",
  "archyx05",
  "naniroma",
  "kstillopkm",
  "jaborro95gordo"
  // Añade tus streamers aquí
];

let accessToken = null;
let tokenExpires = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpires) return accessToken;

  const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, { method: "POST" });
  const data = await res.json();
  accessToken = data.access_token;
  tokenExpires = Date.now() + data.expires_in * 1000;
  return accessToken;
}

async function getStreamersStatus(token) {
  const query = STREAMERS.map(s => `user_login=${s}`).join("&");
  const res = await fetch(`https://api.twitch.tv/helix/streams?${query}`, {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await res.json();
  const streamInfo = {};
  data.data.forEach(s => {
    streamInfo[s.user_login] = {
      title: s.title,
      game: s.game_name,
      viewers: s.viewer_count,
      started_at: s.started_at
    };
  });
  const online = Object.keys(streamInfo);
  return { online, streamInfo };
}

async function getStreamersLogos(token) {
  const query = STREAMERS.map(s => `login=${s}`).join("&");
  const res = await fetch(`https://api.twitch.tv/helix/users?${query}`, {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await res.json();
  const logos = {};
  data.data.forEach(u => {
    logos[u.login] = u.profile_image_url;
  });
  return logos;
}

exports.handler = async () => {
  const token = await getAccessToken();
  const { online, streamInfo } = await getStreamersStatus(token);
  const logos = await getStreamersLogos(token);

  return {
    statusCode: 200,
    body: JSON.stringify({
      all: STREAMERS,
      online,
      logos,
      streamInfo
    })
  };
};
