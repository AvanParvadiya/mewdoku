import React from 'react';
import { audio } from '../utils/AudioEngine';

interface EditProfileModalProps {
  editName: string;
  setEditName: (name: string) => void;
  editAvatar: string;
  setEditAvatar: (avatar: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  editName,
  setEditName,
  editAvatar,
  setEditAvatar,
  onSave,
  onCancel,
}) => {
  const avatarOptions = ['🐱', '🦁', '🐯', '🐈', '🦊', '🐨', '🐼', '🐾', '👑'];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '300px' }}>
        <h3 className="modal-title">Edit Profile 👤</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', margin: '15px 0' }}>
          {/* Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>Name:</label>
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={15}
              className="profile-input"
              placeholder="Enter name..."
            />
          </div>

          {/* Avatar Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>Select Avatar:</label>
            <div className="avatar-picker-grid">
              {avatarOptions.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`avatar-picker-btn ${editAvatar === emoji ? 'selected' : ''}`}
                  onClick={() => {
                    audio.playClick();
                    setEditAvatar(emoji);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-buttons" style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <button 
            className="btn-primary" 
            style={{ flex: 1, padding: '8px' }}
            onClick={onSave}
          >
            Save
          </button>
          <button 
            className="btn-secondary" 
            style={{ flex: 1, padding: '8px' }}
            onClick={() => {
              audio.playClick();
              onCancel();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
