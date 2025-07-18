// Importando o node-fetch versão 2
const fetch = require('node-fetch');  // Usando a versão 2 do node-fetch

module.exports = async (req, res) => {
  // Permitir todas as origens (para desenvolvimento)
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Permitir os métodos POST e GET
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  // Permitir o cabeçalho Content-Type
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Lidar com requisições OPTIONS (preflight requests)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username é obrigatório" });
    }

    try {
      // Fazendo a requisição para a API do Instagram com o username fornecido
      const response = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "x-ig-app-id": "936619743392459", // ID do Instagram app (não oficial)
        }
      });

      const data = await response.json();

      // Verifica se o perfil foi encontrado
      if (!data || !data.data || !data.data.user) {
        return res.status(404).json({ error: "Perfil não encontrado" });
      }

      // Pega os dados do usuário
      const user = data.data.user;

      // Retorna os dados relevantes do perfil
      return res.json({
        username: user.username,
        profile_pic_url: user.profile_pic_url,
        followers: user.edge_followed_by.count,
        following: user.edge_follow.count,
        posts: user.edge_owner_to_timeline_media.count,
        biography: user.biography,
        feed: user.edge_owner_to_timeline_media?.edges?.slice(0, 6).map(p => ({
          image: p.node.display_url,
        })) || [],
      });
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      return res.status(500).json({ error: "Erro ao buscar dados do perfil do Instagram" });
    }
  } else {
    return res.status(405).json({ error: "Método não permitido" });
  }
};
