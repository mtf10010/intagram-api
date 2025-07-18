const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Corrigido para require em vez de import
const axios = require("axios");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// PROXY DE IMAGENS (ESSENCIAL PARA v0.dev)
app.get("/api/image-proxy", async (req, res) => {
    try {
        const { url } = req.query;
        const response = await axios.get(url, {
            responseType: "arraybuffer",
            headers: { "User-Agent": "Mozilla/5.0" },
        });
        res.setHeader("Content-Type", response.headers["content-type"]);
        res.send(response.data);
    } catch (err) {
        res.status(500).json({ error: "Falha no proxy de imagem" });
    }
});

// ROTA PRINCIPAL (INSTAGRAM API)
app.post("/api/profile", async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username é obrigatório" });
    }

    try {
        // Fazendo a requisição para a API do Instagram
        const response = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "x-ig-app-id": "936619743392459", // ID do Instagram app (não oficial)
            }
        });

        // Exibe a resposta da API no console para debugar
        const data = await response.json();
        console.log("Resposta da API Instagram:", data); // Logando a resposta

        // Verifica se a resposta está correta
        if (!data || !data.data || !data.data.user) {
            return res.status(404).json({ error: "Perfil não encontrado" });
        }

        const user = data.data.user;

        // Retorna os dados relevantes do perfil
        res.json({
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
        res.status(500).json({ error: "Erro ao buscar dados do perfil do Instagram" });
    }
});

// Porta onde a API vai rodar
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});
