import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import type { Photo } from './model';

export const photoLimit = 6;
const types: Record<string,string> = { 'image/png': 'png', 'image/jpeg': 'jpeg', 'image/webp': 'webp' };
export function mediaPath(id: string) {
  if (!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id)) throw new Error('Зургийн дугаар буруу.');
  return resolve(/* turbopackIgnore: true */ process.env.WANDERLY_DATA_DIR || '.wanderly', 'uploads', id + '.webp');
}
export async function discard(photos: Photo[]) {
  for (const photo of photos) {
    try { await unlink(mediaPath(photo.id)); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') console.error('Journal media cleanup failed', photo.id); }
  }
}
export async function storePhotos(files: File[], alt: string) {
  if (files.length > photoLimit) throw new Error('Нэг дурсамжид 6 хүртэл зураг оруулна уу.');
  const photos: Photo[] = [];
  try {
    for (const file of files) {
      if (!types[file.type] || !file.size || file.size > 5 * 1024 * 1024) throw new Error('JPEG, PNG, WebP зураг тус бүр 5 МБ хүртэл байна.');
      const decoder = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40000000, failOn: 'warning' });
      const metadata = await decoder.metadata();
      if (metadata.format !== types[file.type]) throw new Error('Зургийн төрөл таарахгүй байна.');
      const { data, info } = await decoder.rotate().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer({resolveWithObject:true});
      const id = randomUUID();
      const path = mediaPath(id);
      await mkdir(resolve(path,'..'), { recursive: true });
      photos.push({id, alt, width:info.width, height:info.height});
      await writeFile(path,data,{flag:'wx'});
    }
    return photos;
  } catch (error) {
    await discard(photos);
    if (error instanceof Error && /[А-Яа-я]/.test(error.message)) throw error;
    throw new Error('Зургийг уншиж хадгалж чадсангүй. Өөр файл сонгоно уу.');
  }
}
