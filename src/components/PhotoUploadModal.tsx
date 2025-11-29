import { useState } from 'react';
import './PhotoUploadModal.css';

interface PhotoUploadModalProps {
  poiId: string;
  poiName: string;
  onClose: () => void;
  onSubmit: (data: { photoUrl?: string; photoFile?: File }) => Promise<void>;
}

function PhotoUploadModal({ poiId, poiName, onClose, onSubmit }: PhotoUploadModalProps) {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMethod === 'url' && !photoUrl) {
      alert('Veuillez entrer une URL de photo');
      return;
    }
    
    if (uploadMethod === 'file' && !photoFile) {
      alert('Veuillez sélectionner une photo');
      return;
    }

    try {
      setUploading(true);
      await onSubmit({
        photoUrl: uploadMethod === 'url' ? photoUrl : undefined,
        photoFile: uploadMethod === 'file' ? photoFile || undefined : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-upload-overlay" onClick={onClose}>
      <div className="photo-upload-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <h2>📷 Ajouter une photo</h2>
        <p className="modal-subtitle">Pour: <strong>{poiName}</strong></p>

        <div className="moderation-notice">
          ⏳ Votre photo sera soumise à modération avant d'être publiée
        </div>

        <form onSubmit={handleSubmit}>
          {/* Upload Method Toggle */}
          <div className="upload-method-toggle">
            <button
              type="button"
              className={`method-btn ${uploadMethod === 'file' ? 'active' : ''}`}
              onClick={() => setUploadMethod('file')}
            >
              📁 Fichier
            </button>
            <button
              type="button"
              className={`method-btn ${uploadMethod === 'url' ? 'active' : ''}`}
              onClick={() => setUploadMethod('url')}
            >
              🔗 URL
            </button>
          </div>

          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div className="upload-section">
              <label className="file-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <div className="file-upload-area">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                  ) : (
                    <>
                      <div className="upload-icon">📸</div>
                      <p>Cliquez pour sélectionner une photo</p>
                      <p className="upload-hint">JPG, PNG, WebP (max 5MB)</p>
                    </>
                  )}
                </div>
              </label>
              {photoFile && (
                <p className="file-name">📄 {photoFile.name}</p>
              )}
            </div>
          )}

          {/* URL Upload */}
          {uploadMethod === 'url' && (
            <div className="upload-section">
              <label>URL de la photo</label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="url-input"
              />
              {photoUrl && (
                <div className="url-preview">
                  <img src={photoUrl} alt="Preview" onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999"%3EImage invalide%3C/text%3E%3C/svg%3E';
                  }} />
                </div>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={uploading}>
              {uploading ? '⏳ Envoi...' : '✅ Soumettre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PhotoUploadModal;
