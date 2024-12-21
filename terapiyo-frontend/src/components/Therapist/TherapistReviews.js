import React from 'react';
import { StarIcon } from '@heroicons/react/solid';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const TherapistReviews = ({
  reviews,
  isLoading,
  error,
  pagination,
  onReview
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Değerlendirmeler yüklenemedi"
        message="Lütfen sayfayı yenileyip tekrar deneyin"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Değerlendirmeler</h2>
        <button
          onClick={onReview}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Değerlendir
        </button>
      </div>

      {/* Değerlendirme özeti */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ortalama puan */}
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <StarIcon className="h-10 w-10 text-yellow-400" />
              <span className="ml-2 text-4xl font-bold text-gray-900">
                {reviews.averageRating}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {reviews.totalReviews} değerlendirme
            </p>
          </div>
        </div>

        {/* Puan dağılımı */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center">
              <div className="flex items-center flex-shrink-0 w-12">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span className="ml-1 text-sm text-gray-600">{rating}</span>
              </div>
              <div className="flex-grow ml-4">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{
                      width: `${
                        (reviews.ratingDistribution[rating] /
                          reviews.totalReviews) *
                        100
                      }%`
                    }}
                  />
                </div>
              </div>
              <div className="flex-shrink-0 ml-4 w-12 text-sm text-gray-500">
                {reviews.ratingDistribution[rating]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Değerlendirme listesi */}
      <div className="mt-8 space-y-6">
        {reviews.items.map((review) => (
          <div key={review._id} className="border-t border-gray-200 pt-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <img
                  src={review.user.avatar}
                  alt={review.user.name}
                  className="h-10 w-10 rounded-full"
                />
              </div>
              <div className="ml-4 flex-grow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {review.user.name}
                    </h4>
                    <div className="mt-1 flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
                {review.therapistResponse && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">
                      Terapist yanıtı
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {review.therapistResponse}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daha fazla yükle */}
      {pagination.hasNextPage && (
        <div className="mt-8 text-center">
          <button
            onClick={() => pagination.fetchNextPage()}
            disabled={pagination.isFetchingNextPage}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {pagination.isFetchingNextPage
              ? 'Yükleniyor...'
              : 'Daha fazla göster'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TherapistReviews;
