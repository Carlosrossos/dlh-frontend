import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

function SEO({ 
  title = 'Dormir Là-Haut - Refuges, Cabanes et Spots de Bivouac en Montagne',
  description = 'Découvrez et partagez les meilleurs refuges, cabanes et spots de bivouac dans les Alpes. Carte interactive, photos, commentaires et informations détaillées.',
  image = 'https://dormir-la-haut.fr/og-image.jpg',
  url = 'https://dormir-la-haut.fr',
  type = 'website'
}: SEOProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };
    
    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('title', title);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    
    // Twitter tags
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:url', url, true);
    
  }, [title, description, image, url, type]);
  
  return null;
}

export default SEO;
