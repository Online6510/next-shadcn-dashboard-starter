import { randomUUID } from 'node:crypto';
import type { Photo } from './model';
import { serverSupabase } from '@/lib/wanderly/supabase';
import { requireUser } from '@/lib/wanderly/auth';
import { normalizePhoto, mediaObjectPath, assertPhotoCount } from './image-transform';

export { mediaObjectPath, photoLimit } from './image-transform';
const bucket = 'wanderly-journal';

export async function discard(photos: Photo[]) {
  if (!photos.length) return;
  const user = await requireUser();
  const supabase = await serverSupabase();
  const paths = photos.map((photo) => mediaObjectPath(user.id,photo.id));
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) console.error('Wanderly private image cleanup failed:',error.message);
}

export async function storePhotos(files:File[], alt:string):Promise<Photo[]> {
  assertPhotoCount(files);
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
