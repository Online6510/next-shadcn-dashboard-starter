'use client';

import {useEffect,useRef,useState} from 'react';
import type {Photo} from './model';

export function UploadPicker({existing=[]}:{existing?:Photo[]}) {
  const input=useRef<HTMLInputElement>(null);
  const [files,setFiles]=useState<File[]>([]);
  const [previews,setPreviews]=useState<string[]>([]);
  const [error,setError]=useState('');
  useEffect(()=>{
    const urls=files.map(file=>URL.createObjectURL(file));
    setPreviews(urls);
    return ()=>urls.forEach(url=>URL.revokeObjectURL(url));
  },[files]);
  function choose(list:FileList|null) {
    if (!input.current || !list) return;
    const values=Array.from(list);
    if(values.length>6 || values.some(file=>file.size>5242880 || !['image/jpeg','image/png','image/webp'].includes(file.type))) {
      input.current.value=''; setFiles([]); setError('6 хүртэл зураг сонгоно уу. Зураг бүр JPEG, PNG, WebP төрлийн, 5 МБ-аас бага байна.');return;
    }
    input.current.files=list;setError('');setFiles(values);
  }
  return <div><label className='upload-zone' onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files)}}>
    Зургаа сонгох эсвэл энд чирэх
    <small>JPEG, PNG, WebP · Нэг дурсамжид 6 зураг · Тус бүр 5 МБ хүртэл</small>
    <input name='uploads' type='file' accept='image/jpeg,image/png,image/webp' multiple ref={input} onChange={e=>choose(e.target.files)} />
  </label>{error && <p role='alert'>{error}</p>}
  <div className='thumbs'>{previews.map((url,i)=><img key={url} src={url} alt={files[i]?.name || 'Сонгосон зураг'} />)}</div>
  {existing.map((photo,i)=><label key={photo.id} className='photo-removal'><img src={'/api/media/'+photo.id} alt={photo.alt}/><input type='checkbox' name='removePhoto' value={photo.id}/> {i+1}-р зургийг хасах</label>)}</div>;
}
