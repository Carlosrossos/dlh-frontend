import { useEffect } from 'react';

interface POIStructuredDataProps {
  name: string;
  description: string;
  image?: string;
  latitude: number;
  longitude: number;
  altitude: number;
  category: string;
  address?: {
    addressRegion: string;
    addressCountry: string;
  };
}

function StructuredData({ 
  name, 
  description, 
  image, 
  latitude, 
  longitude, 
  altitude,
  category,
  address = { addressRegion: 'Alpes', addressCountry: 'FR' }
}: POIStructuredDataProps) {
  
  useEffect(() => {
    // Create structured data for Place/TouristAttraction
    const structuredData = {
      "@context": "https://schema.org",
      "@type": category === 'Refuge' ? 'LodgingBusiness' : 'TouristAttraction',
      "name": name,
      "description": description,
      "image": image || undefined,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": latitude,
        "longitude": longitude,
        "elevation": `${altitude}m`
      },
      "address": {
        "@type": "PostalAddress",
        "addressRegion": address.addressRegion,
        "addressCountry": address.addressCountry
      },
      "touristType": "Hikers, Mountain enthusiasts",
      "amenityFeature": category === 'Refuge' ? [
        {
          "@type": "LocationFeatureSpecification",
          "name": "Shelter",
          "value": true
        }
      ] : undefined
    };

    // Remove existing script if any
    const existingScript = document.getElementById('structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new script
    const script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const scriptToRemove = document.getElementById('structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [name, description, image, latitude, longitude, altitude, category, address]);

  return null;
}

export default StructuredData;
