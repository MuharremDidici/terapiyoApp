import React from 'react';
import { HeartIcon, ChatIcon, CalendarIcon } from '@heroicons/react/outline';
import { StarIcon } from '@heroicons/react/solid';

const TherapistHeader = ({ therapist, onFavorite, onMessage, onAppointment }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={therapist.avatar}
            alt={therapist.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>

        {/* Bilgiler */}
        <div className="mt-4 md:mt-0 md:ml-6 flex-grow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {therapist.name}
              </h1>
              <p className="mt-1 text-gray-600">
                {therapist.title}
              </p>
            </div>

            {/* Puan */}
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 text-lg font-medium text-gray-900">
                {therapist.rating}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                ({therapist.reviewCount} değerlendirme)
              </span>
            </div>
          </div>

          {/* Uzmanlık alanları */}
          <div className="mt-4 flex flex-wrap gap-2">
            {therapist.specialties.map((specialty) => (
              <span
                key={specialty}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {specialty}
              </span>
            ))}
          </div>

          {/* Kısa bilgi */}
          <p className="mt-4 text-gray-600">
            {therapist.shortBio}
          </p>
        </div>
      </div>

      {/* Butonlar */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <button
          onClick={onAppointment}
          className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <CalendarIcon className="h-5 w-5 mr-2" />
          Randevu Al
        </button>

        <button
          onClick={onMessage}
          className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ChatIcon className="h-5 w-5 mr-2" />
          Mesaj Gönder
        </button>

        <button
          onClick={onFavorite}
          className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <HeartIcon
            className={`h-5 w-5 mr-2 ${
              therapist.isFavorite ? 'text-red-500 fill-current' : ''
            }`}
          />
          {therapist.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        </button>
      </div>

      {/* İstatistikler */}
      <div className="mt-6 grid grid-cols-4 gap-4 border-t border-gray-200 pt-6">
        <div>
          <p className="text-sm font-medium text-gray-500">Deneyim</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {therapist.experience} yıl
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Seans Sayısı</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {therapist.sessionCount}+
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Yanıt Oranı</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            %{therapist.responseRate}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Ortalama Yanıt</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {therapist.averageResponseTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TherapistHeader;
