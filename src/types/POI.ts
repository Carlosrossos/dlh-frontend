export type POICategory = 'Cabane' | 'Refuge' | 'Bivouac';
export type Massif = 'Mont Blanc' | 'Vanoise' | 'Écrins' | 'Queyras' | 'Mercantour' | 'Vercors' | 'Chartreuse' | 'Bauges' | 'Aravis' | 'Belledonne';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  massif: Massif;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  altitude: number;
  sunExposition: 'Nord' | 'Sud' | 'Est' | 'Ouest' | 'Nord-Est' | 'Nord-Ouest' | 'Sud-Est' | 'Sud-Ouest';
  photos: string[];
  comments: Comment[];
  likes: number;
  likedBy?: string[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}
