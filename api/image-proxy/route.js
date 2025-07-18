import { NextRequest, NextResponse } from 'next/server';

// Função para lidar com requisições OPTIONS (preflight requests) para /api/image-proxy
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Função para lidar com requisições GET para /api/image-proxy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      const response = NextResponse.json({ error: "URL da imagem é obrigatória" }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    const imageResponse = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!imageResponse.ok) {
      console.error("Falha ao buscar imagem:", imageResponse.status, await imageResponse.text());
      const response = NextResponse.json({ error: "Falha ao buscar imagem" }, { status: imageResponse.status });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    const contentType = imageResponse.headers.get('content-type');
    const arrayBuffer = await imageResponse.arrayBuffer();

    const response = new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*', // Permite qualquer origem
      },
    });
    return response;

  } catch (err) {
    console.error("Erro no proxy de imagem:", err);
    const response = NextResponse.json({ error: "Falha no proxy de imagem" }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
}
