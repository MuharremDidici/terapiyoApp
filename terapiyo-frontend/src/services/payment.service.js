import api from './api';

class PaymentService {
  /**
   * Ödeme yöntemlerini getir
   */
  async getPaymentMethods() {
    try {
      const response = await api.get('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Ödeme yöntemleri getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Kredi kartı ekle
   */
  async addCreditCard(cardData) {
    try {
      const response = await api.post('/payments/cards', cardData);
      return response.data;
    } catch (error) {
      console.error('Kredi kartı ekleme hatası:', error);
      throw error;
    }
  }

  /**
   * Kredi kartını sil
   */
  async deleteCreditCard(cardId) {
    try {
      const response = await api.delete(`/payments/cards/${cardId}`);
      return response.data;
    } catch (error) {
      console.error('Kredi kartı silme hatası:', error);
      throw error;
    }
  }

  /**
   * Ödeme geçmişini getir
   */
  async getPaymentHistory(options = {}) {
    try {
      const params = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 20,
        status: options.status || 'all'
      });

      const response = await api.get(`/payments/history?${params}`);
      return response.data;
    } catch (error) {
      console.error('Ödeme geçmişi getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Fatura detaylarını getir
   */
  async getInvoice(invoiceId) {
    try {
      const response = await api.get(`/payments/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Fatura detayları getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Faturayı indir
   */
  async downloadInvoice(invoiceId) {
    try {
      const response = await api.get(`/payments/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Fatura indirme hatası:', error);
      throw error;
    }
  }

  /**
   * Ödeme yap
   */
  async processPayment(paymentData) {
    try {
      const response = await api.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      console.error('Ödeme işleme hatası:', error);
      throw error;
    }
  }

  /**
   * İade talebi oluştur
   */
  async createRefund(paymentId, refundData) {
    try {
      const response = await api.post(
        `/payments/${paymentId}/refund`,
        refundData
      );
      return response.data;
    } catch (error) {
      console.error('İade talebi oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Cüzdan bakiyesini getir
   */
  async getWalletBalance() {
    try {
      const response = await api.get('/payments/wallet');
      return response.data;
    } catch (error) {
      console.error('Cüzdan bakiyesi getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Cüzdana para yükle
   */
  async topUpWallet(amount) {
    try {
      const response = await api.post('/payments/wallet/topup', { amount });
      return response.data;
    } catch (error) {
      console.error('Cüzdana para yükleme hatası:', error);
      throw error;
    }
  }

  /**
   * Para çekme talebi oluştur
   */
  async createWithdrawal(amount) {
    try {
      const response = await api.post('/payments/wallet/withdraw', { amount });
      return response.data;
    } catch (error) {
      console.error('Para çekme talebi oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Banka hesabı ekle
   */
  async addBankAccount(accountData) {
    try {
      const response = await api.post('/payments/bank-accounts', accountData);
      return response.data;
    } catch (error) {
      console.error('Banka hesabı ekleme hatası:', error);
      throw error;
    }
  }

  /**
   * Banka hesabını sil
   */
  async deleteBankAccount(accountId) {
    try {
      const response = await api.delete(`/payments/bank-accounts/${accountId}`);
      return response.data;
    } catch (error) {
      console.error('Banka hesabı silme hatası:', error);
      throw error;
    }
  }
}

export default new PaymentService();
