import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { poiAPI, adminAPI } from '../services/api';
import type { POI } from '../types/POI';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseApiError } from '../utils/errorHandler';
import SEO from '../components/SEO';
import StructuredData from '../components/StructuredData';
import PhotoUploadModal from '../components/PhotoUploadModal';
import LoadingSpinner from '../components/LoadingSpinner';
import './POIDetail.css';

function POIDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showSuccess, showWarning, showInfo } = useToast();
  const [poi, setPoi] = useState<POI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Comment state
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<POI['comments']>([]);
  
  // Photo state
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  // Edit form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editedPOI, setEditedPOI] = useState({
    name: '',
    altitude: 0,
    sunExposition: '',
    description: '',
  });

  // Pending modifications state
  const [hasPendingComment, setHasPendingComment] = useState(false);
  const [hasPendingPhoto, setHasPendingPhoto] = useState(false);
  const [hasPendingEdit, setHasPendingEdit] = useState(false);

  // Check for pending modifications
  useEffect(() => {
    const checkPendingModifications = async () => {
      if (!user || !id) return;

      try {
        const contributions = await adminAPI.getUserContributions();
        
        // Filter pending modifications for this POI
        interface PendingMod {
          poiId?: { _id: string };
          status: string;
          type: string;
        }
        const pendingForThisPOI = (contributions as PendingMod[]).filter(
          (mod) => mod.poiId?._id === id && mod.status === 'pending'
        );

        setHasPendingComment(pendingForThisPOI.some((mod) => mod.type === 'comment'));
        setHasPendingPhoto(pendingForThisPOI.some((mod) => mod.type === 'photo'));
        setHasPendingEdit(pendingForThisPOI.some((mod) => mod.type === 'edit_poi'));
      } catch (err) {
        console.error('Error checking pending modifications:', err);
      }
    };

    checkPendingModifications();
  }, [user, id]);

  // Fetch POI data
  useEffect(() => {
    const fetchPOI = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await poiAPI.getById(id);
        setPoi(data);
        setLikes(data.likes || 0);
        setComments(data.comments || []);
        setPhotos(data.photos || []);
        
        // Check if user has liked/bookmarked this POI
        if (user) {
          setIsLiked(data.likedBy?.includes(user.id) || false);
          
          // Check bookmarks
          try {
            const bookmarks = await poiAPI.getUserBookmarks();
            setIsBookmarked(bookmarks.includes(id));
          } catch (err) {
            console.error('Error fetching bookmarks:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching POI:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du refuge');
      } finally {
        setLoading(false);
      }
    };

    fetchPOI();
  }, [id, user]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Chargement du refuge..." />;
  }

  if (error || !poi) {
    return (
      <div className="poi-detail-error" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '20px',
        padding: '20px'
      }}>
        <div style={{ fontSize: '64px' }}>😕</div>
        <h2 style={{ margin: 0 }}>POI non trouvé</h2>
        {error && <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>}
        <button 
          onClick={() => navigate('/map')} 
          style={{
            padding: '12px 24px',
            background: '#d4a574',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          🗺️ Retour à la carte
        </button>
      </div>
    );
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleLike = async () => {
    if (!user || !id) {
      showWarning('Vous devez être connecté pour aimer un POI');
      return;
    }

    try {
      const result = await poiAPI.toggleLike(id);
      setIsLiked(result.isLiked);
      setLikes(result.likes);
    } catch (error: unknown) {
      console.error('Error toggling like:', error);
      showError(parseApiError(error));
    }
  };

  const handleBookmark = async () => {
    if (!user || !id) {
      showWarning('Vous devez être connecté pour sauvegarder un POI');
      return;
    }

    try {
      const result = await poiAPI.toggleBookmark(id);
      setIsBookmarked(result.isBookmarked);
      showSuccess(result.isBookmarked ? 'Ajouté aux favoris' : 'Retiré des favoris');
    } catch (error: unknown) {
      console.error('Error toggling bookmark:', error);
      showError(parseApiError(error));
    }
  };

  const handleOpenEditForm = () => {
    if (!user) {
      showWarning('Vous devez être connecté pour proposer des modifications');
      return;
    }
    setEditedPOI({
      name: poi?.name || '',
      altitude: poi?.altitude || 0,
      sunExposition: poi?.sunExposition || '',
      description: poi?.description || '',
    });
    setShowEditForm(true);
  };

  const handleSubmitEdit = async () => {
    if (!id || !poi) return;

    // Déterminer quels champs ont changé
    const changes: Partial<POI> = {};
    if (editedPOI.name !== poi.name) changes.name = editedPOI.name;
    if (editedPOI.altitude !== poi.altitude) changes.altitude = editedPOI.altitude;
    if (editedPOI.sunExposition !== poi.sunExposition) changes.sunExposition = editedPOI.sunExposition as POI['sunExposition'];
    if (editedPOI.description !== poi.description) changes.description = editedPOI.description;

    if (Object.keys(changes).length === 0) {
      showInfo('Aucune modification détectée');
      return;
    }

    try {
      await poiAPI.suggestEdit(id, changes);
      setHasPendingEdit(true);
      showSuccess('Modifications soumises ! Elles seront visibles après validation.');
      setShowEditForm(false);
    } catch (error: unknown) {
      console.error('Error submitting edit:', error);
      showError(parseApiError(error));
    }
  };

  const handleAddComment = async () => {
    if (!user || !id) {
      showWarning('Vous devez être connecté pour commenter');
      return;
    }
    if (!newComment.trim()) {
      showWarning('Veuillez entrer un commentaire');
      return;
    }

    try {
      await poiAPI.addComment(id, newComment);
      setNewComment('');
      setShowCommentForm(false);
      setHasPendingComment(true);
      showSuccess('Commentaire soumis ! Il sera visible après validation.');
    } catch (error: unknown) {
      console.error('Error submitting comment:', error);
      showError(parseApiError(error));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || user.role !== 'admin' || !id) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      await adminAPI.deleteComment(id, commentId);
      
      // Refresh POI data to show updated comments
      const updatedPoi = await poiAPI.getById(id);
      setPoi(updatedPoi);
      
      showSuccess('Commentaire supprimé');
    } catch (error: unknown) {
      console.error('Error deleting comment:', error);
      showError(parseApiError(error));
    }
  };

  const handleAddPhoto = async (data: { photoUrl?: string; photoFile?: File }) => {
    if (!user || !id) {
      showWarning('Vous devez être connecté pour ajouter une photo');
      return;
    }

    try {
      if (data.photoUrl) {
        // URL upload
        try {
          new URL(data.photoUrl);
          await poiAPI.addPhoto(id, data.photoUrl);
          setHasPendingPhoto(true);
          showSuccess('Photo soumise ! Elle sera visible après validation.');
        } catch {
          showError('URL invalide. Veuillez entrer une URL valide.');
          throw new Error('URL invalide');
        }
      } else if (data.photoFile) {
        // File upload
        await poiAPI.uploadPhoto(id, data.photoFile);
        setHasPendingPhoto(true);
        showSuccess('Photo uploadée ! Elle sera visible après validation.');
      }
    } catch (error: unknown) {
      console.error('Error submitting photo:', error);
      showError(parseApiError(error));
      throw error;
    }
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
    <div className="poi-detail-page">
      {/* SEO Meta Tags */}
      <SEO
        title={`${poi.name} - ${poi.category} ${poi.massif} (${poi.altitude}m) | Dormir Là-Haut`}
        description={poi.description || `Découvrez ${poi.name}, un ${poi.category.toLowerCase()} situé dans le massif ${poi.massif} à ${poi.altitude}m d'altitude. ${poi.sunExposition ? `Exposition ${poi.sunExposition}.` : ''}`}
        image={poi.photos && poi.photos.length > 0 ? poi.photos[0] : undefined}
        url={`https://dormir-la-haut.fr/poi/${poi.id}`}
        type="place"
      />
      
      {/* Structured Data for SEO */}
      <StructuredData
        name={poi.name}
        description={poi.description}
        image={poi.photos && poi.photos.length > 0 ? poi.photos[0] : undefined}
        latitude={poi.coordinates.lat}
        longitude={poi.coordinates.lng}
        altitude={poi.altitude}
        category={poi.category}
        address={{
          addressRegion: poi.massif,
          addressCountry: 'FR'
        }}
      />
      
      <div className="poi-detail-container">
        {/* Header with back button */}
        <div className="poi-detail-header">
          <button onClick={() => navigate('/map')} className="back-btn">
            ← Retour
          </button>
          <button
            onClick={() => navigate(`/map?poi=${poi.id}`)}
            className="view-map-btn"
          >
            🗺️ Voir sur la carte
          </button>
        </div>

        {/* Main Layout: Gallery + Content */}
        <div className="poi-main-layout">
          {/* Left: Photo Gallery */}
          <div className="poi-gallery-column">
            <div className="poi-detail-gallery">
              {photos.length > 0 ? (
                <>
                  <img src={photos[currentPhotoIndex]} alt={poi.name} />
                  {photos.length > 1 && (
                    <>
                      <button className="gallery-btn prev" onClick={prevPhoto}>
                        ‹
                      </button>
                      <button className="gallery-btn next" onClick={nextPhoto}>
                        ›
                      </button>
                      <div className="gallery-indicator">
                        {currentPhotoIndex + 1} / {photos.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="no-photos-placeholder">
                  <div className="no-photos-icon">📷</div>
                  <p className="no-photos-text">Aucune photo disponible</p>
                  <p className="no-photos-subtext">Soyez le premier à partager une photo de ce lieu!</p>
                </div>
              )}
            </div>

            {/* Add Photo Button */}
            {user && (
              <div className="add-photo-section">
                <button 
                  className="add-photo-btn" 
                  onClick={() => setShowPhotoForm(true)}
                  disabled={hasPendingPhoto}
                  style={{ 
                    opacity: hasPendingPhoto ? 0.5 : 1, 
                    cursor: hasPendingPhoto ? 'not-allowed' : 'pointer' 
                  }}
                  title={hasPendingPhoto ? 'Vous avez déjà une photo en attente de validation' : ''}
                >
                  {hasPendingPhoto ? '⏳ Photo en attente' : '📷 Ajouter une photo'}
                </button>
              </div>
            )}
          </div>

          {/* Right: Content */}
          <div className="poi-detail-content">
          <div className="poi-detail-title-section">
            <div>
              <h1>{poi.name}</h1>
              <span
                className="poi-detail-badge"
                style={{ backgroundColor: getCategoryColor(poi.category) }}
              >
                {poi.category}
              </span>
            </div>
            <div className="poi-detail-actions">
              <button 
                className="action-btn-large edit" 
                onClick={handleOpenEditForm}
                disabled={hasPendingEdit}
                style={{ 
                  opacity: hasPendingEdit ? 0.5 : 1, 
                  cursor: hasPendingEdit ? 'not-allowed' : 'pointer' 
                }}
                title={hasPendingEdit ? 'Vous avez déjà une modification en attente de validation' : ''}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {hasPendingEdit ? '⏳ Modification en attente' : 'Éditer'}
              </button>
              <button className={`action-btn-large bookmark ${isBookmarked ? 'bookmarked' : ''}`} onClick={handleBookmark}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}
              </button>
              <button className={`action-btn-large like ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {likes}
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="poi-detail-info-grid">
            <div className="info-item">
              <span className="info-label">Massif</span>
              <span className="info-value">{poi.massif}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Altitude</span>
              <span className="info-value">{poi.altitude} m</span>
            </div>
            <div className="info-item">
              <span className="info-label">Orientation</span>
              <span className="info-value">{poi.sunExposition || 'Non renseignée'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Coordonnées</span>
              <span className="info-value">
                {poi.coordinates.lat.toFixed(4)}, {poi.coordinates.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="poi-detail-section">
            <h2>Description</h2>
            <p>{poi.description}</p>
          </div>
          </div>
        </div>

        {/* Comments Section - Full Width */}
        <div className="poi-comments-full-width">
          <div className="section-header-with-action">
            <h2>Commentaires ({comments.length})</h2>
            {user && !showCommentForm && (
              <button 
                className="add-comment-btn" 
                onClick={() => setShowCommentForm(true)}
                disabled={hasPendingComment}
                style={{ 
                  opacity: hasPendingComment ? 0.5 : 1, 
                  cursor: hasPendingComment ? 'not-allowed' : 'pointer' 
                }}
                title={hasPendingComment ? 'Vous avez déjà un commentaire en attente de validation' : ''}
              >
                {hasPendingComment ? '⏳ Commentaire en attente' : '💬 Ajouter un commentaire'}
              </button>
            )}
          </div>

          {showCommentForm && (
            <div className="comment-form">
              <div className="moderation-notice">
                ⏳ Votre commentaire sera soumis à modération avant d'être publié
              </div>
              <textarea
                placeholder="Votre commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="comment-textarea"
              />
              <div className="comment-form-actions">
                <button className="submit-btn" onClick={handleAddComment}>
                  Soumettre pour validation
                </button>
                <button className="cancel-btn" onClick={() => { setShowCommentForm(false); setNewComment(''); }}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Edit Form Modal */}
          {showEditForm && (
            <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
              <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
                <h3>✏️ Proposer des modifications</h3>
                <p style={{ color: '#6c757d', marginBottom: '20px', fontSize: '0.9rem' }}>
                  Vos modifications seront soumises à validation avant d'être publiées.
                </p>
                
                <div className="edit-form">
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      value={editedPOI.name}
                      onChange={(e) => setEditedPOI({...editedPOI, name: e.target.value})}
                      className="edit-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Altitude (m)</label>
                    <input
                      type="number"
                      value={editedPOI.altitude}
                      onChange={(e) => setEditedPOI({...editedPOI, altitude: parseInt(e.target.value) || 0})}
                      className="edit-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Exposition</label>
                    <select
                      value={editedPOI.sunExposition}
                      onChange={(e) => setEditedPOI({...editedPOI, sunExposition: e.target.value})}
                      className="edit-select"
                    >
                      <option value="">Non renseignée</option>
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

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={editedPOI.description}
                      onChange={(e) => setEditedPOI({...editedPOI, description: e.target.value})}
                      className="edit-textarea"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button onClick={handleSubmitEdit} className="submit-btn">
                    Soumettre les modifications
                  </button>
                  <button onClick={() => setShowEditForm(false)} className="cancel-btn">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {comments.length > 0 ? (
            <div className="comments-list-full">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-full">
                  <div className="comment-header-full">
                    <strong>{comment.author}</strong>
                    <span className="comment-date-full">
                      {new Date(comment.date).toLocaleDateString('fr-FR')}
                    </span>
                    {user?.role === 'admin' && (
                      <button
                        className="delete-comment-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Supprimer ce commentaire"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <p className="comment-text-full">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-comments-full">Aucun commentaire pour le moment.</p>
          )}
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoForm && (
        <PhotoUploadModal
          poiId={poi.id}
          poiName={poi.name}
          onClose={() => setShowPhotoForm(false)}
          onSubmit={handleAddPhoto}
        />
      )}
    </div>
  );
}

export default POIDetail;
