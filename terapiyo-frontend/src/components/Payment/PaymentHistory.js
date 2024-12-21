import React, { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  CreditCardIcon,
  BanknotesIcon,
  DownloadIcon,
  RefreshIcon
} from '@heroicons/react/outline';
import { usePayment } from '../../hooks/usePayment';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import RefundModal from './RefundModal';

const PaymentHistory = () => {
  const { usePaymentHistory, createRefund, isLoading } = usePayment();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all'
  });

  const { data: history, isLoading: isLoadingHistory } =
    usePaymentHistory(filters);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Ödeme durumu
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Ödeme durumu başlığı
  const getStatusTitle = (status) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'pending':
        return 'Bekliyor';
      case 'failed':
        return 'Başarısız';
      case 'refunded':
        return 'İade Edildi';
      default:
        return status;
    }
  };

  // Ödeme yöntemi ikonu
  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'card':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'wallet':
      case 'bank':
        return <BanknotesIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // İade talebi oluştur
  const handleRefund = (payment) => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
  };

  if (isLoadingHistory) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Başlık */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">
          Ödeme Geçmişi
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Tüm ödemelerinizi ve iadelerinizi görüntüleyin
        </p>
      </div>

      {/* Filtreler */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          {['all', 'completed', 'pending', 'failed', 'refunded'].map(
            (status) => (
              <button
                key={status}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, status, page: 1 }))
                }
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.status === status
                    ? getStatusColor(status)
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getStatusTitle(status)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Ödeme listesi */}
      <div className="divide-y divide-gray-200">
        {history.items.map((payment) => (
          <div key={payment.id} className="p-4">
            <div className="flex items-center justify-between">
              {/* Ödeme detayları */}
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-full ${
                    payment.type === 'card'
                      ? 'bg-blue-100 text-blue-500'
                      : 'bg-green-100 text-green-500'
                  }`}
                >
                  {getPaymentMethodIcon(payment.type)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {payment.description}
                  </p>
                  <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                    <span>
                      {format(new Date(payment.date), 'd MMMM yyyy HH:mm', {
                        locale: tr
                      })}
                    </span>
                    <span>•</span>
                    <span>#{payment.id}</span>
                  </div>
                </div>
              </div>

              {/* Tutar ve durum */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {payment.amount} TL
                  </p>
                  <p
                    className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusTitle(payment.status)}
                  </p>
                </div>

                {/* İşlemler */}
                <div className="flex items-center space-x-2">
                  {payment.status === 'completed' && !payment.refunded && (
                    <button
                      onClick={() => handleRefund(payment)}
                      disabled={isLoading.refund}
                      className="p-1 rounded-full text-gray-400 hover:text-yellow-500"
                    >
                      <RefreshIcon className="h-5 w-5" />
                    </button>
                  )}
                  {payment.invoice && (
                    <a
                      href={payment.invoice}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-full text-gray-400 hover:text-blue-500"
                    >
                      <DownloadIcon className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {history.items.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Henüz ödeme geçmişiniz yok
          </div>
        )}
      </div>

      {/* Sayfalama */}
      {history.pagination && history.pagination.pages > 1 && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={filters.page === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Önceki
            </button>
            <span className="text-sm text-gray-700">
              Sayfa {filters.page} / {history.pagination.pages}
            </span>
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={filters.page === history.pagination.pages}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      {/* İade modalı */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default PaymentHistory;
