import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapView from '../components/MapView';
import POIList from '../components/POIList';
import LoadingSpinner from '../components/LoadingSpinner';
import POISkeleton from '../components/POISkeleton';
import { poiAPI } from '../services/api';
import type { POI, POICategory, Massif } from '../types/POI';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseApiError } from '../utils/errorHandler';
import './Map.css';

type ViewMode = 'map' | 'list';

function Map() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<POICategory | 'all'>('all');
  const [selectedExposition, setSelectedExposition] = useState<string>('all');
  const [selectedMassif, setSelectedMassif] = useState<string>('all');
  const [showProposeForm, setShowProposeForm] = useState(false);
  const [selectingLocation, setSelectingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [focusedPOI, setFocusedPOI] = useState<string | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Fetch POIs from API
  useEffect(() => {
    const fetchPOIs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await poiAPI.getAll({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          massif: selectedMassif !== 'all' ? selectedMassif : undefined,
          search: searchQuery || undefined,
        });
        setPois(data);
      } catch (err: unknown) {
        console.error('Error fetching POIs:', err);
        const message = parseApiError(err);
        setError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPOIs();
  }, [selectedCategory, selectedMassif, searchQuery]);

  // Check for POI in URL params
  useEffect(() => {
    const poiId = searchParams.get('poi');
    if (poiId) {
      setFocusedPOI(poiId);
      setViewMode('map');
    }
  }, [searchParams]);

  const [proposedSpot, setProposedSpot] = useState({
    name: '',
    category: 'Bivouac' as POICategory,
    massif: 'Mont Blanc' as Massif,
    description: '',
    altitude: 1000,
    sunExposition: 'Sud' as POI['sunExposition'],
    coordinates: { lat: 0, lng: 0 },
    photoUrl: ''
  });

  // Filter POIs based on exposition (client-side filter)
  const filteredPOIs = pois.filter((poi) => {
    const matchesExposition = selectedExposition === 'all' || poi.sunExposition === selectedExposition;
    return matchesExposition;
  });

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedExposition !== 'all' || selectedMassif !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedExposition('all');
    setSelectedMassif('all');
  };

  const handleStartProposal = () => {
    if (!user) {
      alert('Vous devez être connecté pour proposer un spot');
      return;
    }
    setSelectingLocation(true);
  };

  const handleCancelLocation = () => {
    setSelectingLocation(false);
    setTempLocation(null);
  };

  const handleValidateLocation = () => {
    if (tempLocation) {
      setProposedSpot(prev => ({
        ...prev,
        coordinates: tempLocation
      }));
      setSelectingLocation(false);
      setShowProposeForm(true);
    }
  };

  const handleProposeSpot = async () => {
    if (!proposedSpot.name.trim() || !proposedSpot.description.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // Prepare POI data
      const poiData = {
        name: proposedSpot.name,
        category: proposedSpot.category,
        massif: proposedSpot.massif,
        description: proposedSpot.description,
        altitude: proposedSpot.altitude,
        sunExposition: proposedSpot.sunExposition,
        coordinates: proposedSpot.coordinates,
        photos: proposedSpot.photoUrl ? [proposedSpot.photoUrl] : [],
      };

      await poiAPI.create(poiData);
      
      // Reset form
      setProposedSpot({
        name: '',
        category: 'Bivouac' as POICategory,
        massif: 'Mont Blanc' as const,
        description: '',
        altitude: 1000,
        sunExposition: 'Sud' as const,
        coordinates: { lat: 0, lng: 0 },
        photoUrl: ''
      });
      setShowProposeForm(false);
      setTempLocation(null);
      
      alert('✅ Votre proposition de spot a été soumise et sera examinée par un administrateur.');
    } catch (error) {
      console.error('Error proposing spot:', error);
      alert('❌ Erreur: ' + (error instanceof Error ? error.message : 'Une erreur est survenue'));
    }
  };

  return (
    <div className="map-page">
      <div className="map-header">
        {/* View Toggle - Left */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <span>🗺️</span> Carte
          </button>
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <span>📋</span> Liste
          </button>
        </div>

        {/* Search Bar - Center */}
        <div className="search-bar">
          <div className={`search-input-wrapper ${searchExpanded ? 'expanded' : ''}`}>
            <button 
              className="search-icon-btn"
              onClick={() => setSearchExpanded(!searchExpanded)}
              title={searchExpanded ? "Fermer la recherche" : "Ouvrir la recherche"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <div className={`search-container ${searchExpanded ? 'visible' : ''}`}>
              <input
                type="text"
                placeholder="Rechercher un lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus={searchExpanded}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="clear-search-btn"
                  title="Effacer la recherche"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Actions - Right */}
        <div className="filters-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as POICategory | 'all')}
            className="filter-select"
          >
            <option value="all">Toutes catégories</option>
            <option value="Cabane">Cabane</option>
            <option value="Refuge">Refuge</option>
            <option value="Bivouac">Bivouac</option>
          </select>

          <select
            value={selectedExposition}
            onChange={(e) => setSelectedExposition(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes expositions</option>
            <option value="Nord">Nord</option>
            <option value="Sud">Sud</option>
            <option value="Est">Est</option>
            <option value="Ouest">Ouest</option>
            <option value="Nord-Est">Nord-Est</option>
            <option value="Nord-Ouest">Nord-Ouest</option>
            <option value="Sud-Est">Sud-Est</option>
            <option value="Sud-Ouest">Sud-Ouest</option>
          </select>

          <select
            value={selectedMassif}
            onChange={(e) => setSelectedMassif(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous massifs</option>
            <option value="Mont Blanc">Mont Blanc</option>
            <option value="Vanoise">Vanoise</option>
            <option value="Écrins">Écrins</option>
            <option value="Queyras">Queyras</option>
            <option value="Mercantour">Mercantour</option>
            <option value="Vercors">Vercors</option>
            <option value="Chartreuse">Chartreuse</option>
            <option value="Bauges">Bauges</option>
            <option value="Aravis">Aravis</option>
            <option value="Belledonne">Belledonne</option>
          </select>

          {hasActiveFilters && (
            <button onClick={resetFilters} className="reset-btn" title="Réinitialiser les filtres">
              ✕
            </button>
          )}
          <span className="poi-count">
            {filteredPOIs.length} lieu{filteredPOIs.length > 1 ? 'x' : ''}
          </span>
        </div>

        {/* Propose Spot Button - Only show in map mode */}
        {viewMode === 'map' && user && !selectingLocation && !showProposeForm && (
          <button 
            className="propose-btn"
            onClick={handleStartProposal}
            title="Proposer un nouveau spot"
          >
            Proposer un spot
          </button>
        )}
      </div>

      {/* Propose Spot Form */}
      {showProposeForm && (
        <div className="propose-form-overlay">
          <div className="propose-form">
            <h3>+ Proposer un nouveau spot</h3>
            <div className="moderation-notice">
              ⏳ Votre proposition sera soumise à modération avant d'être publiée
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Nom du spot *</label>
                <input
                  type="text"
                  placeholder="Nom du lieu"
                  value={proposedSpot.name}
                  onChange={(e) => setProposedSpot(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Catégorie</label>
                <select
                  value={proposedSpot.category}
                  onChange={(e) => setProposedSpot(prev => ({ ...prev, category: e.target.value as POICategory }))}
                >
                  <option value="Bivouac">Bivouac</option>
                  <option value="Cabane">Cabane</option>
                  <option value="Refuge">Refuge</option>
                </select>
              </div>

              <div className="form-group">
                <label>Massif</label>
                <select
                  value={proposedSpot.massif}
                  onChange={(e) => setProposedSpot(prev => ({ ...prev, massif: e.target.value as Massif }))}
                >
                  <option value="Mont Blanc">Mont Blanc</option>
                  <option value="Vanoise">Vanoise</option>
                  <option value="Écrins">Écrins</option>
                  <option value="Queyras">Queyras</option>
                  <option value="Mercantour">Mercantour</option>
                  <option value="Vercors">Vercors</option>
                  <option value="Chartreuse">Chartreuse</option>
                  <option value="Bauges">Bauges</option>
                  <option value="Aravis">Aravis</option>
                  <option value="Belledonne">Belledonne</option>
                </select>
              </div>

              <div className="form-group">
                <label>Altitude (m)</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={proposedSpot.altitude}
                  onChange={(e) => setProposedSpot(prev => ({ ...prev, altitude: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="form-group">
                <label>Exposition</label>
                <select
                  value={proposedSpot.sunExposition}
                  onChange={(e) => setProposedSpot(prev => ({ ...prev, sunExposition: e.target.value as POI['sunExposition'] }))}
                >
                  <option value="Nord">Nord</option>
                  <option value="Sud">Sud</option>
                  <option value="Est">Est</option>
                  <option value="Ouest">Ouest</option>
                  <option value="Nord-Est">Nord-Est</option>
                  <option value="Nord-Ouest">Nord-Ouest</option>
                  <option value="Sud-Est">Sud-Est</option>
                  <option value="Sud-Ouest">Sud-Ouest</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Description *</label>
                <textarea
                  placeholder="Décrivez ce lieu..."
                  value={proposedSpot.description}
                  onChange={(e) => setProposedSpot(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="form-group full-width">
                <label>Photo (URL optionnelle)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={proposedSpot.photoUrl}
                  onChange={(e) => setProposedSpot(prev => ({ ...prev, photoUrl: e.target.value }))}
                />
              </div>

              <div className="form-group full-width">
                <label>Position</label>
                <div className="coordinates-info">
                  <span>📍 {proposedSpot.coordinates.lat.toFixed(4)}, {proposedSpot.coordinates.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button 
                className="submit-btn" 
                onClick={handleProposeSpot}
                disabled={!proposedSpot.name.trim() || !proposedSpot.description.trim()}
              >
                Soumettre la proposition
              </button>
              <button 
                className="cancel-btn" 
                onClick={() => setShowProposeForm(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Selection Overlay */}
      {selectingLocation && (
        <div className="location-selection-overlay">
          <div className="location-instructions">
            <h3>📍 Sélectionnez la position du spot</h3>
            <p>Cliquez sur la carte pour placer le marqueur</p>
            {tempLocation && (
              <div className="location-actions">
                <button className="validate-location-btn" onClick={handleValidateLocation}>
                  ✅ Valider la position
                </button>
                <button className="cancel-location-btn" onClick={handleCancelLocation}>
                  ❌ Annuler
                </button>
              </div>
            )}
            {!tempLocation && (
              <button className="cancel-location-btn" onClick={handleCancelLocation}>
                ❌ Annuler
              </button>
            )}
          </div>
        </div>
      )}

      {loading && viewMode === 'map' && (
        <LoadingSpinner 
          fullScreen 
          text={`Chargement des refuges...`}
        />
      )}

      {loading && viewMode === 'list' && (
        <POISkeleton count={5} />
      )}

      {error && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000,
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>❌</div>
          <p style={{ color: '#ef4444', fontSize: '16px', marginBottom: '20px' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{
            padding: '12px 24px',
            background: '#d4a574',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#c49564'}
          onMouseOut={(e) => e.currentTarget.style.background = '#d4a574'}
          >
            🔄 Réessayer
          </button>
        </div>
      )}

      {!loading && !error && viewMode === 'map' ? (
        <MapView 
          pois={filteredPOIs} 
          onMapClick={selectingLocation ? (lat: number, lng: number) => {
            setTempLocation({ lat, lng });
          } : undefined}
          clickMode={selectingLocation ? 'select-location' : 'normal'}
          selectedLocation={tempLocation || undefined}
          focusedPOIId={focusedPOI || undefined}
        />
      ) : !loading && !error ? (
        <POIList pois={filteredPOIs} />
      ) : null}
    </div>
  );
}

export default Map;
