import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';

const TherapistAbout = ({ therapist }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900">Hakkında</h2>

      {/* Biyografi */}
      <div className="mt-4">
        <div
          className={`prose prose-blue max-w-none ${
            !isExpanded ? 'line-clamp-4' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: therapist.biography }}
        />
        <button
          className="mt-2 flex items-center text-blue-600 hover:text-blue-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              Daha az göster
              <ChevronUpIcon className="ml-1 h-5 w-5" />
            </>
          ) : (
            <>
              Devamını oku
              <ChevronDownIcon className="ml-1 h-5 w-5" />
            </>
          )}
        </button>
      </div>

      {/* Eğitim */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900">Eğitim</h3>
        <div className="mt-2 space-y-4">
          {therapist.education.map((edu, index) => (
            <div key={index} className="flex">
              <div className="flex-shrink-0 w-12">
                <img
                  src={edu.logo}
                  alt={edu.school}
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <div>
                <p className="text-gray-900 font-medium">{edu.school}</p>
                <p className="text-gray-600">{edu.degree}</p>
                <p className="text-sm text-gray-500">
                  {edu.startYear} - {edu.endYear || 'Devam ediyor'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sertifikalar */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900">Sertifikalar</h3>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {therapist.certificates.map((cert, index) => (
            <div
              key={index}
              className="flex items-center p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <img
                  src={cert.logo}
                  alt={cert.name}
                  className="w-12 h-12 rounded-lg"
                />
              </div>
              <div className="ml-4">
                <p className="text-gray-900 font-medium">{cert.name}</p>
                <p className="text-sm text-gray-500">{cert.issuer}</p>
                <p className="text-sm text-gray-500">
                  Veriliş: {new Date(cert.issueDate).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Çalışma alanları */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900">Çalışma Alanları</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {therapist.expertiseAreas.map((area, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Terapi yaklaşımları */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Terapi Yaklaşımları
        </h3>
        <div className="mt-2 space-y-4">
          {therapist.approaches.map((approach, index) => (
            <div key={index}>
              <p className="text-gray-900 font-medium">{approach.name}</p>
              <p className="text-gray-600">{approach.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapistAbout;
