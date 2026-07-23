import { useState, useEffect } from 'react';

export function useUserProfile() {
  const [username, setUsername] = useState('Mew Master');
  const [avatar, setAvatar] = useState('🐱');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('mewdoku_profile_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    const savedAvatar = localStorage.getItem('mewdoku_profile_avatar');
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

  const saveProfile = (newUsername: string, newAvatar: string) => {
    setUsername(newUsername);
    setAvatar(newAvatar);
    localStorage.setItem('mewdoku_profile_username', newUsername);
    localStorage.setItem('mewdoku_profile_avatar', newAvatar);
  };

  const handleOpenEditProfile = () => {
    setEditName(username);
    setEditAvatar(avatar);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    const trimmed = editName.trim();
    const finalName = trimmed ? trimmed : 'Mew Master';
    saveProfile(finalName, editAvatar);
    setIsEditingProfile(false);
  };

  return {
    username,
    avatar,
    isEditingProfile,
    setIsEditingProfile,
    editName,
    setEditName,
    editAvatar,
    setEditAvatar,
    handleOpenEditProfile,
    handleSaveProfile,
  };
}
