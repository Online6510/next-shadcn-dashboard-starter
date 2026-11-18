import {NextRequest} from 'next/server';
import {optionalUser} from '@/lib/wanderly/auth';
import {getTrip} from '@/features/wanderly/db';
import {exportTripWaypointsGPX,exportTripCSV,exportTripCalendarICS} from '@/features/wanderly/export';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const user=await optionalUser();
 if(!user)return new Response(null,{status:401,headers:{'Cache-Control':'no-store'}});
 const {id}=await params;
 if(!/^[a-zA-Z0-9_-]{1,128}$/.test(id))return new Response(null,{status:404});
 const trip=await getTrip(id);
 if(!trip)return new Response(null,{status:404});
 const format=request.nextUrl.searchParams.get('format');
 const data=format==='gpx'
  ?{type:'application/gpx+xml; charset=utf-8',extension:'gpx',body:exportTripWaypointsGPX(trip)}
  :format==='csv'
  ?{type:'text/csv; charset=utf-8',extension:'csv',body:exportTripCSV(trip)}
  :format==='ics'
  ?{type:'text/calendar; charset=utf-8',extension:'ics',body:exportTripCalendarICS(trip)}
  :null;
 if(!data)return new Response('Unsupported export format',{status:400});
 return new Response(data.body,{headers:{
  'Content-Type':data.type,
  'Content-Disposition':'attachment; filename="wanderly-'+id.slice(0,50)+'.'+data.extension+'"',
  'Cache-Control':'private,no-store',
  'X-Content-Type-Options':'nosniff'
 }});
}
