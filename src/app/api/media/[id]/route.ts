import { readFile } from 'node:fs/promises';
import { mediaPath } from '@/features/wanderly/media';

export async function GET(_: Request, {params}: {params: Promise<{id:string}>}) {
  try {
    const data = await readFile(mediaPath((await params).id));
    return new Response(new Uint8Array(data), {headers:{'Content-Type':'image/webp','X-Content-Type-Options':'nosniff','Cache-Control':'private, no-cache'}});
  } catch { return new Response(null,{status:404}); }
}
