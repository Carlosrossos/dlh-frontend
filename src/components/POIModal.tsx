import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { POI } from '../types/POI';
import './POIModal.css';

interface POIModalProps {
  poi: POI;
  onClose: () => void;
}

function POIModal({ poi, onClose }: POIModalProps) {
  const navigate = useNavigate();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250); // Match animation duration
  };

  const handleViewFullDetails = () => {
    navigate(`/poi/${poi.id}`);
    handleClose();
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % poi.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + poi.photos.length) % poi.photos.length);
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

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>{poi.name}</h2>
          <span
            className="category-badge"
            style={{ backgroundColor: getCategoryColor(poi.category) }}
          >
            {poi.category}
          </span>
        </div>

        {/* Photo Slider */}
        {poi.photos.length > 0 ? (
          <div className="photo-slider">
            <img src={poi.photos[currentPhotoIndex]} alt={poi.name} />
            {poi.photos.length > 1 && (
              <>
                <button className="slider-btn prev" onClick={prevPhoto}>
                  ‹
                </button>
                <button className="slider-btn next" onClick={nextPhoto}>
                  ›
                </button>
                <div className="photo-indicator">
                  {currentPhotoIndex + 1} / {poi.photos.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="modal-no-photos">
            <div className="modal-no-photos-icon">📷</div>
            <p className="modal-no-photos-text">Aucune photo disponible</p>
          </div>
        )}

        {/* POI Quick Info */}
        <div className="poi-quick-info">
          <div className="quick-info-item">
            <span className="info-label">Massif</span>
            <span className="info-value">{poi.massif}</span>
          </div>
          <div className="quick-info-item">
            <span className="info-label">Altitude</span>
            <span className="info-value">{poi.altitude} m</span>
          </div>
          <div className="quick-info-item">
            <span className="info-label">Orientation</span>
            <span className="info-value">{poi.sunExposition}</span>
          </div>
        </div>

        {/* Description Preview */}
        <div className="poi-description-preview">
          <p>{poi.description}</p>
        </div>

        {/* View Full Details Button */}
        <div className="modal-full-details">
          <button onClick={handleViewFullDetails} className="btn-full-details">
            📄 Voir tous les détails
          </button>
        </div>
      </div>
    </div>
  );
}

export default POIModal;
