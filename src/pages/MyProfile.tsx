import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { poiAPI, adminAPI, authAPI } from '../services/api';
import type { POI } from '../types/POI';
import './MyProfile.css';

type TabType = 'bookmarks' | 'contributions' | 'stats' | 'settings';

interface ContributionData {
  name?: string;
  description?: string;
  text?: string;
  photoUrl?: string;
  [key: string]: unknown;
}

interface Contribution {
  _id: string;
  type: 'new_poi' | 'comment' | 'photo' | 'edit_poi';
  status: 'pending' | 'approved' | 'rejected';
  data: ContributionData;
  poiId?: { name: string; category: string };
  createdAt: string;
  rejectionReason?: string;
}

function MyProfile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('bookmarks');
  const [bookmarks, setBookmarks] = useState<POI[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingContributions, setLoadingContributions] = useState(false);
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Load bookmarks
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const bookmarkIds = await poiAPI.getUserBookmarks();
        
        // Fetch full POI data for each bookmark
        const bookmarkPromises = bookmarkIds.map(id => poiAPI.getById(id));
        const bookmarksData = await Promise.all(bookmarkPromises);
        
        setBookmarks(bookmarksData);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, [user]);

  // Load contributions when tab is active
  useEffect(() => {
    const loadContributions = async () => {
      if (!user || activeTab !== 'contributions') return;
      
      try {
        setLoadingContributions(true);
        const data = await adminAPI.getUserContributions();
        setContributions(data as Contribution[]);
      } catch (error) {
        console.error('Error loading contributions:', error);
      } finally {
        setLoadingContributions(false);
      }
    };

    loadContributions();
  }, [user, activeTab]);

  const handleRemoveBookmark = async (poiId: string) => {
    try {
      await poiAPI.toggleBookmark(poiId);
      setBookmarks(bookmarks.filter(poi => poi.id !== poiId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  // Profile editing handlers
  const handleStartEditing = () => {
    setEditName(user?.name || '');
    setEditAvatar(user?.avatar || '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileError(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('L\'image ne doit pas dépasser 5 Mo');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setProfileError('Seules les images sont acceptées');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setEditAvatar(''); // Clear URL if file is selected
      setProfileError(null);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    
    try {
      setUploadingAvatar(true);
      setProfileError(null);
      
      const result = await authAPI.uploadAvatar(avatarFile);
      
      updateUser({
        avatar: result.user.avatar,
      });
      
      setAvatarFile(null);
      setAvatarPreview(null);
      setEditAvatar(result.user.avatar);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setProfileError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      setProfileError('Le nom doit contenir au moins 2 caractères');
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError(null);

      // If there's a file to upload, do it first
      if (avatarFile) {
        await handleUploadAvatar();
      }
      
      const result = await authAPI.updateProfile({
        name: editName.trim(),
        avatar: editAvatar.trim() || undefined,
      });
      
      // Update local state
      updateUser({
        name: result.user.name,
        avatar: result.user.avatar,
      });
      
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <h2>Vous devez être connecté</h2>
          <button onClick={() => navigate('/signin')} className="btn-primary">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.replace('/');
    logout();
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ ATTENTION : Cette action est irréversible. Toutes vos données (favoris, contributions, commentaires) seront définitivement supprimées. Êtes-vous absolument sûr de vouloir supprimer votre compte ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du compte');
      }

      alert('✅ Votre compte a été supprimé avec succès.');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('❌ Erreur lors de la suppression du compte. Veuillez réessayer.');
    }
  };

  const isAdmin = user.role === 'admin';

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="header-content">
            <div className="user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="avatar-image" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="user-info">
              <h1>{user.name}</h1>
              <p className="user-email">{user.email}</p>
              {isAdmin && <span className="admin-badge">👑 Administrateur</span>}
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Déconnexion
          </button>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            🔖 Mes Favoris ({bookmarks.length})
          </button>
          <button
            className={`tab ${activeTab === 'contributions' ? 'active' : ''}`}
            onClick={() => setActiveTab('contributions')}
          >
            📝 Mes Contributions
          </button>
          <button
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistiques
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Paramètres
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'bookmarks' && (
            <div className="bookmarks-section">
              <h2>Mes POIs Favoris</h2>
              {loading ? (
                <p>🔄 Chargement...</p>
              ) : bookmarks.length === 0 ? (
                <div className="empty-state">
                  <p>📭 Vous n'avez pas encore de favoris</p>
                  <button onClick={() => navigate('/map')} className="btn-primary">
                    Explorer les POIs
                  </button>
                </div>
              ) : (
                <div className="bookmarks-grid">
                  {bookmarks.map((poi) => (
                    <div key={poi.id} className="bookmark-card">
                      <div className="bookmark-image">
                        {poi.photos && poi.photos.length > 0 ? (
                          <img src={poi.photos[0]} alt={poi.name} />
                        ) : (
                          <div className="no-image">📷</div>
                        )}
                      </div>
                      <div className="bookmark-info">
                        <h3>{poi.name}</h3>
                        <p className="bookmark-category">{poi.category}</p>
                        <p className="bookmark-location">📍 {poi.massif} • {poi.altitude}m</p>
                        <div className="bookmark-actions">
                          <button
                            onClick={() => navigate(`/poi/${poi.id}`)}
                            className="btn-view"
                          >
                            👁️ Voir
                          </button>
                          <button
                            onClick={() => handleRemoveBookmark(poi.id)}
                            className="btn-remove"
                          >
                            🗑️ Retirer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'contributions' && (
            <div className="contributions-section">
              <h2>Mes Contributions</h2>
              {loadingContributions ? (
                <p>🔄 Chargement...</p>
              ) : contributions.length === 0 ? (
                <div className="empty-state">
                  <p>📝 Vous n'avez pas encore de contributions</p>
                  <button onClick={() => navigate('/')} className="btn-primary">
                    Commencer à contribuer
                  </button>
                </div>
              ) : (
                <div className="contributions-list">
                  {contributions.map((contrib) => (
                    <div key={contrib._id} className={`contribution-card status-${contrib.status}`}>
                      <div className="contribution-header">
                        <span className={`contribution-type type-${contrib.type}`}>
                          {contrib.type === 'new_poi' && '🆕 Nouveau POI'}
                          {contrib.type === 'comment' && '💬 Commentaire'}
                          {contrib.type === 'photo' && '📸 Photo'}
                          {contrib.type === 'edit_poi' && '✏️ Modification'}
                        </span>
                        <span className={`contribution-status status-${contrib.status}`}>
                          {contrib.status === 'pending' && '⏳ En attente'}
                          {contrib.status === 'approved' && '✅ Approuvé'}
                          {contrib.status === 'rejected' && '❌ Rejeté'}
                        </span>
                      </div>

                      {contrib.poiId && (
                        <div className="contribution-poi">
                          POI: <strong>{contrib.poiId.name}</strong> ({contrib.poiId.category})
                        </div>
                      )}

                      <div className="contribution-content">
                        {contrib.type === 'new_poi' && (
                          <div>
                            <strong>{contrib.data.name}</strong>
                            <p>{contrib.data.description?.substring(0, 100)}...</p>
                          </div>
                        )}
                        {contrib.type === 'comment' && (
                          <p className="comment-preview">"{contrib.data.text}"</p>
                        )}
                        {contrib.type === 'photo' && (
                          <img src={contrib.data.photoUrl} alt="Photo" className="photo-preview" />
                        )}
                        {contrib.type === 'edit_poi' && (
                          <div className="edit-preview">
                            Modifications: {Object.keys(contrib.data).join(', ')}
                          </div>
                        )}
                      </div>

                      {contrib.status === 'rejected' && contrib.rejectionReason && (
                        <div className="rejection-reason">
                          <strong>Raison du rejet:</strong> {contrib.rejectionReason}
                        </div>
                      )}

                      <div className="contribution-date">
                        {new Date(contrib.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-section">
              <h2>Statistiques</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🔖</div>
                  <div className="stat-value">{bookmarks.length}</div>
                  <div className="stat-label">Favoris</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-value">{contributions.length}</div>
                  <div className="stat-label">Contributions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">❤️</div>
                  <div className="stat-value">0</div>
                  <div className="stat-label">Likes donnés</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-value">Explorateur</div>
                  <div className="stat-label">Niveau</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Mon Profil</h2>
              <div className="settings-card">
                {!isEditing ? (
                  <>
                    <div className="profile-info">
                      <div className="info-row">
                        <strong>Avatar:</strong>
                        <span>
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="mini-avatar" />
                          ) : (
                            <span className="no-avatar">Aucun avatar</span>
                          )}
                        </span>
                      </div>
                      <div className="info-row">
                        <strong>Nom:</strong>
                        <span>{user.name}</span>
                      </div>
                      <div className="info-row">
                        <strong>Email:</strong>
                        <span>{user.email}</span>
                      </div>
                      <div className="info-row">
                        <strong>Rôle:</strong>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                        </span>
                      </div>
                    </div>
                    <button onClick={handleStartEditing} className="edit-profile-btn">
                      ✏️ Modifier mon profil
                    </button>
                  </>
                ) : (
                  <div className="edit-profile-form">
                    <h3>Modifier mon profil</h3>
                    
                    {profileError && (
                      <div className="profile-error-msg">{profileError}</div>
                    )}
                    
                    <div className="form-group">
                      <label>Nom d'utilisateur</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Votre nom"
                        maxLength={50}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Avatar</label>
                      
                      {/* File upload */}
                      <div className="avatar-upload-section">
                        <label className="file-upload-btn">
                          📷 Choisir une image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <span className="file-hint">ou</span>
                        <input
                          type="url"
                          value={editAvatar}
                          onChange={(e) => {
                            setEditAvatar(e.target.value);
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                          placeholder="Coller une URL"
                          className="url-input"
                        />
                      </div>
                      
                      {/* Preview */}
                      {(avatarPreview || editAvatar) && (
                        <div className="avatar-preview">
                          <img 
                            src={avatarPreview || editAvatar} 
                            alt="Aperçu" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          {avatarFile && (
                            <span className="file-name">📎 {avatarFile.name}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        onClick={handleSaveProfile} 
                        className="save-btn"
                        disabled={savingProfile || uploadingAvatar}
                      >
                        {savingProfile || uploadingAvatar ? '⏳ Enregistrement...' : '💾 Enregistrer'}
                      </button>
                      <button 
                        onClick={handleCancelEditing} 
                        className="cancel-btn"
                        disabled={savingProfile || uploadingAvatar}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Panel Button */}
              {isAdmin && (
                <div className="admin-panel-section">
                  <h2>🛡️ Administration</h2>
                  <p>Gérer les propositions de modifications et les nouveaux POIs</p>
                  <button 
                    onClick={() => navigate('/admin')} 
                    className="admin-panel-btn"
                  >
                    Accéder au Panel Admin →
                  </button>
                </div>
              )}

              {/* Delete Account Section */}
              <div className="delete-account-section">
                <h2>Supprimer mon compte</h2>
                <p>La suppression de votre compte est définitive et irréversible.</p>
                <button 
                  onClick={handleDeleteAccount}
                  className="delete-account-btn"
                >
                  🗑️ Supprimer mon compte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
