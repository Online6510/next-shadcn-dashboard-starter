import {MapExplorer} from '@/features/wanderly/map-explorer';
import {getTrips} from '@/features/wanderly/db';
export const dynamic='force-dynamic';
export const metadata={title:'Газрын зураг'};
export default async function MapPage(){
 const trips=await getTrips();
 return <MapExplorer trips={trips}/>;
}
