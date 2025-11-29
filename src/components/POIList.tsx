import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { POI } from '../types/POI';
import POIModal from './POIModal';
import './POIList.css';

interface POIListProps {
  pois: POI[];
}

const ITEMS_PER_PAGE = 12;

function POIList({ pois }: POIListProps) {
  const navigate = useNavigate();
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(pois.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPOIs = pois.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cabane':
        return '#8b7355';
      case 'Refuge':
        return '#a0826d';
      case 'Spot':
        return '#d4a574';
      default:
        return '#8b7355';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cabane':
        return '🛖';
      case 'Refuge':
        return '🏠';
      case 'Spot':
        return '⛺';
      default:
        return '';
    }
  };

  const handleCardClick = (poi: POI) => {
    // Navigate directly to POI detail page using React Router
    navigate(`/poi/${poi.id}`);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="poi-list-container">
      {/* Results info */}
      <div className="list-header">
        <p className="results-count">
          {pois.length} refuge{pois.length > 1 ? 's' : ''} trouvé{pois.length > 1 ? 's' : ''}
          {totalPages > 1 && ` • Page ${currentPage} sur ${totalPages}`}
        </p>
      </div>

      <div className="poi-grid">
        {currentPOIs.map((poi) => (
          <div
            key={poi.id}
            className="poi-card"
            onClick={() => handleCardClick(poi)}
          >
            <div className="poi-card-image">
              {poi.photos && poi.photos.length > 0 ? (
                <img src={poi.photos[0]} alt={poi.name} />
              ) : (
                <div className="poi-card-no-photo">
                  <div className="no-photo-icon">📷</div>
                  <p className="no-photo-text">Aucune photo</p>
                </div>
              )}
              <span
                className="poi-card-badge"
                style={{ backgroundColor: getCategoryColor(poi.category) }}
              >
                {getCategoryIcon(poi.category)} {poi.category}
              </span>
            </div>
            <div className="poi-card-content">
              <h3>{poi.name}</h3>
              <div className="poi-card-info">
                <span>⬆️ {poi.altitude}m</span>
                <span>🧭 {poi.sunExposition || 'Orientation non renseignée'}</span>
              </div>
              <p className="poi-card-description">{poi.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Précédent
          </button>

          <div className="pagination-numbers">
            {getPageNumbers().map((page, index) => (
              typeof page === 'number' ? (
                <button
                  key={index}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="pagination-ellipsis">
                  {page}
                </span>
              )
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant →
          </button>
        </div>
      )}

      {selectedPOI && (
        <POIModal poi={selectedPOI} onClose={() => setSelectedPOI(null)} />
      )}
    </div>
  );
}

export default POIList;
