import sharp from 'sharp';

export const photoLimit = 6;
export function assertPhotoCount(files: File[]) {
 if(files.length > photoLimit) throw new Error('Нэг дурсамжид 6 хүртэл зураг оруулна уу.');
}
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

