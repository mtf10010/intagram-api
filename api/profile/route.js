import { NextRequest, NextResponse } from 'next/server';

// Função para lidar com requisições OPTIONS (preflight requests) para /api/profile
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  // É CRÍTICO que este cabeçalho esteja presente na resposta OPTIONS
  response.headers.set('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Função para lidar com requisições POST para /api/profile
export async function POST(request: NextRequest) {
  const { username } = await request.json();

  if (!username) {
    const response = NextResponse.json({ error: "Username é obrigatório" }, { status: 400 });
    response.headers.set('Access-Control-Allow-Origin', '*'); // Também é importante na resposta POST
    return response;
  }

  try {
    const instagramResponse = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "x-ig-app-id": "936619743392459",
      }
    });

    if (!instagramResponse.ok) {
      console.error("Erro ao buscar dados do Instagram:", instagramResponse.status, await instagramResponse.text());
      const response = NextResponse.json({ error: "Perfil não encontrado ou erro na API do Instagram" }, { status: instagramResponse.status });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    const data = await instagramResponse.json();
    console.log("Resposta da API Instagram:", data); // Logando a resposta

    if (!data || !data.data || !data.data.user) {
      const response = NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    const user = data.data.user;

    const profileData = {
      username: user.username,
      profile_pic_url: user.profile_pic_url,
      followers: user.edge_followed_by.count,
      following: user.edge_follow.count,
      posts: user.edge_owner_to_timeline_media.count,
      biography: user.biography,
      feed: user.edge_owner_to_timeline_media?.edges?.slice(0, 6).map((p: any) => ({
        image: p.node.display_url,
      })) || [],
    };

    const response = NextResponse.json(profileData, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*'); // E aqui também
    return response;

  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    const response = NextResponse.json({ error: "Erro ao buscar dados do perfil do Instagram" }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
}
