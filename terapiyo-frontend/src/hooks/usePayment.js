import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import paymentService from '../services/payment.service';

export const usePayment = () => {
  const queryClient = useQueryClient();

  // Ödeme yöntemleri
  const usePaymentMethods = () => {
    return useQuery('paymentMethods', () => paymentService.getPaymentMethods());
  };

  // Ödeme geçmişi
  const usePaymentHistory = (options = {}) => {
    return useQuery(['paymentHistory', options], () =>
      paymentService.getPaymentHistory(options)
    );
  };

  // Cüzdan bakiyesi
  const useWalletBalance = () => {
    return useQuery('walletBalance', () => paymentService.getWalletBalance(), {
      refetchInterval: 60000 // Her dakika güncelle
    });
  };

  // Kredi kartı ekle
  const addCreditCardMutation = useMutation(
    (cardData) => paymentService.addCreditCard(cardData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentMethods');
        toast.success('Kredi kartı başarıyla eklendi');
      },
      onError: () => {
        toast.error('Kredi kartı eklenemedi');
      }
    }
  );

  // Kredi kartı sil
  const deleteCreditCardMutation = useMutation(
    (cardId) => paymentService.deleteCreditCard(cardId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentMethods');
        toast.success('Kredi kartı başarıyla silindi');
      },
      onError: () => {
        toast.error('Kredi kartı silinemedi');
      }
    }
  );

  // Ödeme yap
  const processPaymentMutation = useMutation(
    (paymentData) => paymentService.processPayment(paymentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentHistory');
        queryClient.invalidateQueries('walletBalance');
        toast.success('Ödeme başarıyla tamamlandı');
      },
      onError: () => {
        toast.error('Ödeme işlemi başarısız');
      }
    }
  );

  // İade talebi
  const createRefundMutation = useMutation(
    ({ paymentId, refundData }) =>
      paymentService.createRefund(paymentId, refundData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentHistory');
        queryClient.invalidateQueries('walletBalance');
        toast.success('İade talebi oluşturuldu');
      },
      onError: () => {
        toast.error('İade talebi oluşturulamadı');
      }
    }
  );

  // Cüzdana para yükle
  const topUpWalletMutation = useMutation(
    (amount) => paymentService.topUpWallet(amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('walletBalance');
        queryClient.invalidateQueries('paymentHistory');
        toast.success('Para yükleme işlemi başarılı');
      },
      onError: () => {
        toast.error('Para yükleme işlemi başarısız');
      }
    }
  );

  // Para çekme talebi
  const createWithdrawalMutation = useMutation(
    (amount) => paymentService.createWithdrawal(amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('walletBalance');
        queryClient.invalidateQueries('paymentHistory');
        toast.success('Para çekme talebi oluşturuldu');
      },
      onError: () => {
        toast.error('Para çekme talebi oluşturulamadı');
      }
    }
  );

  // Banka hesabı ekle
  const addBankAccountMutation = useMutation(
    (accountData) => paymentService.addBankAccount(accountData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentMethods');
        toast.success('Banka hesabı başarıyla eklendi');
      },
      onError: () => {
        toast.error('Banka hesabı eklenemedi');
      }
    }
  );

  // Banka hesabı sil
  const deleteBankAccountMutation = useMutation(
    (accountId) => paymentService.deleteBankAccount(accountId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentMethods');
        toast.success('Banka hesabı başarıyla silindi');
      },
      onError: () => {
        toast.error('Banka hesabı silinemedi');
      }
    }
  );

  return {
    // Sorgular
    usePaymentMethods,
    usePaymentHistory,
    useWalletBalance,

    // Yükleniyor durumları
    isLoading: {
      addCard: addCreditCardMutation.isLoading,
      deleteCard: deleteCreditCardMutation.isLoading,
      payment: processPaymentMutation.isLoading,
      refund: createRefundMutation.isLoading,
      topUp: topUpWalletMutation.isLoading,
      withdrawal: createWithdrawalMutation.isLoading,
      addBankAccount: addBankAccountMutation.isLoading,
      deleteBankAccount: deleteBankAccountMutation.isLoading
    },

    // Metodlar
    addCreditCard: addCreditCardMutation.mutate,
    deleteCreditCard: deleteCreditCardMutation.mutate,
    processPayment: processPaymentMutation.mutate,
    createRefund: createRefundMutation.mutate,
    topUpWallet: topUpWalletMutation.mutate,
    createWithdrawal: createWithdrawalMutation.mutate,
    addBankAccount: addBankAccountMutation.mutate,
    deleteBankAccount: deleteBankAccountMutation.mutate
  };
};
