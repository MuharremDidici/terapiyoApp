import React, { useState } from 'react';
import {
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  BanknotesIcon
} from '@heroicons/react/outline';
import { usePayment } from '../../hooks/usePayment';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import AddCardModal from './AddCardModal';
import AddBankAccountModal from './AddBankAccountModal';

const PaymentMethods = () => {
  const {
    usePaymentMethods,
    deleteCreditCard,
    deleteBankAccount,
    isLoading
  } = usePayment();

  const { data: paymentMethods, isLoading: isLoadingMethods } =
    usePaymentMethods();

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  if (isLoadingMethods) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Başlık */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">
          Ödeme Yöntemleri
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Kayıtlı ödeme yöntemlerinizi yönetin
        </p>
      </div>

      {/* Kredi kartları */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            Kredi Kartları
          </h3>
          <button
            onClick={() => setShowAddCardModal(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Kart Ekle
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods?.cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <CreditCardIcon className="h-8 w-8 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    •••• •••• •••• {card.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    {card.brand} - Son Kullanma: {card.expMonth}/
                    {card.expYear}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteCreditCard(card.id)}
                disabled={isLoading.deleteCard}
                className="p-1 rounded-full text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}

          {paymentMethods?.cards.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-3">
              Henüz kayıtlı kartınız yok
            </p>
          )}
        </div>
      </div>

      {/* Banka hesapları */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            Banka Hesapları
          </h3>
          <button
            onClick={() => setShowAddBankModal(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Hesap Ekle
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods?.bankAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <BanknotesIcon className="h-8 w-8 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {account.bankName}
                  </p>
                  <p className="text-sm text-gray-500">
                    IBAN: TR•• •••• •••• •••• •••• {account.last4}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteBankAccount(account.id)}
                disabled={isLoading.deleteBankAccount}
                className="p-1 rounded-full text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}

          {paymentMethods?.bankAccounts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-3">
              Henüz kayıtlı banka hesabınız yok
            </p>
          )}
        </div>
      </div>

      {/* Modallar */}
      <AddCardModal
        isOpen={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
      />

      <AddBankAccountModal
        isOpen={showAddBankModal}
        onClose={() => setShowAddBankModal(false)}
      />
    </div>
  );
};

export default PaymentMethods;
