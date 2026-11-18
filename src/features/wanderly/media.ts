import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import type { Photo } from './model';
import { serverSupabase } from '@/lib/wanderly/supabase';
import { requireUser } from '@/lib/wanderly/auth';

export const photoLimit = 6;
const bucket = 'wanderly-journal';
const types: Record<string,string> = {
  'image/png':'png',
  'image/jpeg':'jpeg',
  'image/webp':'webp'
};
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;

export function mediaObjectPath(ownerId: string, photoId: string) {
  if (!uuid.test(ownerId) || !uuid.test(photoId)) throw new Error('Зургийн дугаар буруу.');
  return ownerId + '/' + photoId + '.webp';
}

export async function normalizePhoto(file: File): Promise<{
  data: Buffer; width: number; height: number;
}> {
  if (!types[file.type] || !file.size || file.size > 5*1024*1024)
    throw new Error('JPEG, PNG, WebP зураг тус бүр 5 МБ хүртэл байна.');
  const decoder = sharp(Buffer.from(await file.arrayBuffer()), {
    limitInputPixels: 40000000, failOn:'warning'
  });
  const metadata = await decoder.metadata();
  if (metadata.format !== types[file.type])
    throw new Error('Зургийн төрөл таарахгүй байна.');
  const { data, info } = await decoder.rotate()
    .resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true})
    .webp({quality:85})
    .toBuffer({resolveWithObject:true});
  return {data,width:info.width,height:info.height};
}

export async function discard(photos: Photo[]) {
  if (!photos.length) return;
  const user = await requireUser();
  const supabase = await serverSupabase();
  const paths = photos.map((photo) => mediaObjectPath(user.id,photo.id));
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) console.error('Wanderly private image cleanup failed:',error.message);
}

export async function storePhotos(files:File[], alt:string):Promise<Photo[]> {
  if (files.length > photoLimit)
    throw new Error('Нэг дурсамжид 6 хүртэл зураг оруулна уу.');
  if (!files.length) return [];
  // Decode and validate before any upload so malformed files never reach Storage.
  const prepared = await Promise.all(files.map(normalizePhoto));
  const user = await requireUser();
  const supabase = await serverSupabase();
  const photos: Photo[]=[];
  try {
    for (let i=0;i<prepared.length;i++) {
      const photo=prepared[i];
      const id=randomUUID();
      const { error } = await supabase.storage.from(bucket)
        .upload(mediaObjectPath(user.id,id),photo.data,{
          contentType:'image/webp',upsert:false,cacheControl:'3600'
        });
      if (error) throw new Error('Зургийг хадгалж чадсангүй.');
      photos.push({id,alt,width:photo.width,height:photo.height});
    }
    return photos;
  } catch(error) {
    await discard(photos);
    throw error;
  }
}
