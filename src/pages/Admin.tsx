import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseApiError } from '../utils/errorHandler';
import './Admin.css';

interface ModificationData {
  name?: string;
  category?: string;
  massif?: string;
  altitude?: number;
  sunExposition?: string;
  coordinates?: { lat: number; lng: number };
  description?: string;
  photos?: string[];
  text?: string;
  photoUrl?: string;
  [key: string]: string | number | string[] | { lat: number; lng: number } | undefined;
}

interface PendingModification {
  _id: string;
  type: 'new_poi' | 'comment' | 'photo' | 'edit_poi';
  userId: { name: string; email: string };
  poiId?: { name: string; category: string };
  data: ModificationData;
  status: string;
  createdAt: string;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  byType: Array<{ _id: string; count: number }>;
}

function Admin() {
  const { user } = useAuth();
  const { showError, showSuccess, showWarning } = useToast();
  const navigate = useNavigate();
  const [modifications, setModifications] = useState<PendingModification[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<{ [key: string]: string[] }>({});

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch pending modifications
  useEffect(() => {
    fetchModifications();
    fetchStats();
  }, [filter]);

  const fetchModifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?type=${filter}` : '';
      
      const response = await fetch(`http://localhost:3001/api/admin/pending${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setModifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching modifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (id: string) => {
    const modification = modifications.find(m => m._id === id);
    
    // For edit_poi type, check if fields are selected
    if (modification?.type === 'edit_poi') {
      const fields = selectedFields[id];
      if (!fields || fields.length === 0) {
        alert('Veuillez sélectionner au moins un champ à approuver');
        return;
      }
    }

    if (!confirm('Approuver cette modification?')) return;

    try {
      const token = localStorage.getItem('token');
      const body: { selectedFields?: string[] } = {};
      
      // Add selectedFields for edit_poi type
      if (modification?.type === 'edit_poi' && selectedFields[id]) {
        body.selectedFields = selectedFields[id];
      }
      
      const response = await fetch(`http://localhost:3001/api/admin/pending/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Modification approuvée !');
        // Clear selected fields for this modification
        setSelectedFields(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
        fetchModifications();
        fetchStats();
      } else {
        showError(data.error || 'Erreur lors de l\'approbation');
      }
    } catch (error: unknown) {
      console.error('Error approving:', error);
      showError(parseApiError(error));
    }
  };

  const toggleFieldSelection = (modId: string, field: string) => {
    setSelectedFields(prev => {
      const current = prev[modId] || [];
      const newFields = current.includes(field)
        ? current.filter(f => f !== field)
        : [...current, field];
      return { ...prev, [modId]: newFields };
    });
  };

  const initializeFieldSelection = (modId: string, fields: string[]) => {
    if (!selectedFields[modId]) {
      setSelectedFields(prev => ({ ...prev, [modId]: fields }));
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      showWarning('Veuillez entrer une raison de rejet');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/pending/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Modification rejetée');
        setRejectingId(null);
        setRejectionReason('');
        fetchModifications();
        fetchStats();
      } else {
        showError(data.error || 'Erreur lors du rejet');
      }
    } catch (error: unknown) {
      console.error('Error rejecting:', error);
      showError(parseApiError(error));
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new_poi': return '🆕 Nouveau POI';
      case 'comment': return '💬 Commentaire';
      case 'photo': return '📷 Photo';
      case 'edit_poi': return '✏️ Modification';
      default: return type;
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'name': return 'Nom';
      case 'altitude': return 'Altitude';
      case 'sunExposition': return 'Exposition';
      case 'description': return 'Description';
      default: return field;
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🛡️ Panel Administrateur</h1>
        <button onClick={() => navigate('/map')} className="back-btn">
          ← Retour à la carte
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">En attente</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approuvées</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">Rejetées</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          Toutes
        </button>
        <button 
          className={filter === 'new_poi' ? 'active' : ''} 
          onClick={() => setFilter('new_poi')}
        >
          🆕 Nouveaux POIs
        </button>
        <button 
          className={filter === 'comment' ? 'active' : ''} 
          onClick={() => setFilter('comment')}
        >
          💬 Commentaires
        </button>
        <button 
          className={filter === 'photo' ? 'active' : ''} 
          onClick={() => setFilter('photo')}
        >
          📷 Photos
        </button>
        <button 
          className={filter === 'edit_poi' ? 'active' : ''} 
          onClick={() => setFilter('edit_poi')}
        >
          ✏️ Modifications
        </button>
      </div>

      {/* Modifications List */}
      <div className="modifications-list">
        {loading ? (
          <p>Chargement...</p>
        ) : modifications.length === 0 ? (
          <div className="no-modifications">
            <p>✅ Aucune modification en attente</p>
          </div>
        ) : (
          modifications.map((mod) => (
            <div key={mod._id} className="modification-card">
              <div className="mod-header">
                <span className="mod-type">{getTypeLabel(mod.type)}</span>
                <span className="mod-date">
                  {new Date(mod.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <div className="mod-user">
                Par: <strong>{mod.userId.name}</strong> ({mod.userId.email})
              </div>

              {mod.poiId && (
                <div className="mod-poi">
                  POI: <strong>{mod.poiId.name}</strong> ({mod.poiId.category})
                </div>
              )}

              <div className="mod-data">
                {mod.type === 'new_poi' && (
                  <div className="new-poi-preview">
                    <h4>{mod.data.name}</h4>
                    <div className="poi-details">
                      <p><strong>Catégorie:</strong> {mod.data.category}</p>
                      <p><strong>Massif:</strong> {mod.data.massif}</p>
                      <p><strong>Altitude:</strong> {mod.data.altitude}m</p>
                      {mod.data.sunExposition && (
                        <p><strong>Exposition:</strong> {mod.data.sunExposition}</p>
                      )}
                      <p><strong>Coordonnées:</strong> {mod.data.coordinates?.lat?.toFixed(4)}, {mod.data.coordinates?.lng?.toFixed(4)}</p>
                    </div>
                    <p className="poi-description">{mod.data.description}</p>
                    {mod.data.photos && mod.data.photos.length > 0 && (
                      <img src={mod.data.photos[0]} alt="POI" className="mod-photo" />
                    )}
                  </div>
                )}
                {mod.type === 'comment' && (
                  <div className="comment-preview">
                    <p className="comment-text">"{mod.data.text}"</p>
                  </div>
                )}
                {mod.type === 'photo' && (
                  <div className="photo-preview">
                    <img src={mod.data.photoUrl} alt="Photo proposée" className="mod-photo" />
                  </div>
                )}
                {mod.type === 'edit_poi' && (
                  <div className="edit-fields">
                    {(() => {
                      // Initialize selection with all fields on first render
                      const fields = Object.keys(mod.data);
                      initializeFieldSelection(mod._id, fields);
                      return null;
                    })()}
                    {Object.entries(mod.data).map(([key, value]) => (
                      <div key={key} className="field-checkbox">
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedFields[mod._id]?.includes(key) || false}
                            onChange={() => toggleFieldSelection(mod._id, key)}
                          />
                          <span className="field-name">{getFieldLabel(key)}:</span>
                          <span className="field-value">{String(value)}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mod-actions">
                {rejectingId === mod._id ? (
                  <div className="reject-form">
                    <input
                      type="text"
                      placeholder="Raison du rejet..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="reject-input"
                    />
                    <button onClick={() => handleReject(mod._id)} className="btn-confirm-reject">
                      Confirmer le rejet
                    </button>
                    <button onClick={() => setRejectingId(null)} className="btn-cancel">
                      Annuler
                    </button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => handleApprove(mod._id)} className="btn-approve">
                      ✅ Approuver
                    </button>
                    <button onClick={() => setRejectingId(mod._id)} className="btn-reject">
                      ❌ Rejeter
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Admin;
