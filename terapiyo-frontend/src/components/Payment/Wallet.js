import React, { useState } from 'react';
import {
  CashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon
} from '@heroicons/react/outline';
import { usePayment } from '../../hooks/usePayment';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import TopUpModal from './TopUpModal';
import WithdrawModal from './WithdrawModal';

const Wallet = () => {
  const { useWalletBalance, isLoading } = usePayment();
  const { data: wallet, isLoading: isLoadingWallet } = useWalletBalance();

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  if (isLoadingWallet) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Başlık */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Cüzdanım</h2>
        <p className="mt-1 text-sm text-gray-500">
          Cüzdan bakiyenizi yönetin
        </p>
      </div>

      {/* Bakiye */}
      <div className="p-6">
        <div className="text-center">
          <CashIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Mevcut Bakiye
          </h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {wallet.balance} TL
          </p>

          {/* İşlem butonları */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowTopUpModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Para Yükle
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowDownIcon className="h-5 w-5 mr-2" />
              Para Çek
            </button>
          </div>
        </div>

        {/* İşlem özeti */}
        <div className="mt-8">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Son İşlemler
          </h4>
          <div className="mt-2 divide-y divide-gray-200">
            {wallet.transactions?.map((transaction) => (
              <div
                key={transaction.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center">
                  {transaction.type === 'topup' ? (
                    <ArrowUpIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5 text-red-500" />
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.type === 'topup'
                        ? 'Para Yükleme'
                        : 'Para Çekme'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.date}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-medium ${
                    transaction.type === 'topup'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'topup' ? '+' : '-'}
                  {transaction.amount} TL
                </p>
              </div>
            ))}

            {wallet.transactions?.length === 0 && (
              <p className="py-3 text-sm text-gray-500 text-center">
                Henüz işlem yapılmadı
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modallar */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={wallet.balance}
      />
    </div>
  );
};

export default Wallet;
