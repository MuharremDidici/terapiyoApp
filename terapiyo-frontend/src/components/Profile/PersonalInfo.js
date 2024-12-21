import React, { useState } from 'react';
import { CameraIcon } from '@heroicons/react/outline';
import { useProfile } from '../../hooks/useProfile';
import LoadingSpinner from '../Common/LoadingSpinner';

const PersonalInfo = ({ profile }) => {
  const { updateProfile, updateAvatar, isLoading } = useProfile();

  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    title: profile.title,
    bio: profile.bio,
    specialties: profile.specialties || [],
    education: profile.education || [],
    experience: profile.experience || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateAvatar(file);
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? value : item
      )
    }));
  };

  const handleArrayAdd = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profil fotoğrafı */}
      <div className="flex items-center">
        <div className="relative">
          <img
            src={profile.avatar}
            alt={profile.firstName}
            className="h-24 w-24 rounded-full object-cover"
          />
          <label
            htmlFor="avatar"
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white shadow-lg cursor-pointer hover:bg-gray-50"
          >
            <CameraIcon className="h-5 w-5 text-gray-500" />
            <input
              type="file"
              id="avatar"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isLoading.avatar}
            />
          </label>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">
            Profil Fotoğrafı
          </h3>
          <p className="text-sm text-gray-500">
            JPG, PNG veya GIF. En fazla 2MB.
          </p>
        </div>
      </div>

      {/* Ad ve soyad */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            Ad
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Soyad
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      {/* İletişim bilgileri */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            E-posta
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Unvan */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Unvan
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Biyografi */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          Biyografi
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) =>
            setFormData({ ...formData, bio: e.target.value })
          }
          rows={4}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Uzmanlık alanları */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Uzmanlık Alanları
        </label>
        <div className="mt-2 space-y-2">
          {formData.specialties.map((specialty, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={specialty}
                onChange={(e) =>
                  handleArrayChange('specialties', index, e.target.value)
                }
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => handleArrayRemove('specialties', index)}
                className="text-red-600 hover:text-red-700"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleArrayAdd('specialties')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Alan Ekle
          </button>
        </div>
      </div>

      {/* Eğitim */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Eğitim
        </label>
        <div className="mt-2 space-y-2">
          {formData.education.map((edu, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={edu}
                onChange={(e) =>
                  handleArrayChange('education', index, e.target.value)
                }
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => handleArrayRemove('education', index)}
                className="text-red-600 hover:text-red-700"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleArrayAdd('education')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Eğitim Ekle
          </button>
        </div>
      </div>

      {/* Deneyim */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Deneyim
        </label>
        <div className="mt-2 space-y-2">
          {formData.experience.map((exp, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={exp}
                onChange={(e) =>
                  handleArrayChange('experience', index, e.target.value)
                }
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => handleArrayRemove('experience', index)}
                className="text-red-600 hover:text-red-700"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleArrayAdd('experience')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Deneyim Ekle
          </button>
        </div>
      </div>

      {/* Kaydet butonu */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading.profile}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading.profile ? <LoadingSpinner size="sm" /> : 'Kaydet'}
        </button>
      </div>
    </form>
  );
};

export default PersonalInfo;
