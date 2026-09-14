import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  price: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bookTitle, price }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const chave = '2497|uaFzvldEYZWRXExkJ5wzzEwpcoW7x6gJkALhrxpiccf65ef6';
      const url = "https://paysuite.tech/api/v1/payments";

      const headers = {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const body = {
        amount: price.toString(),
        reference: `LIVRO${Date.now()}`,
        description: `Pagamento para ${bookTitle}`,
        return_url: window.location.origin,
        webhook_url: "https://example.com/webhook",
        contact_id: ""
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data?.data?.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else {
        setError(data?.message || 'Ocorreu um erro ao processar o pagamento.');
        console.error("Erro PaySuite:", data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>Finalizar Compra</h2>
          <p className="book-title">{bookTitle}</p>
          <div className="price-tag">{price} MZN</div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Nome Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              className="input-field"
              placeholder="Ex: Momade Júnior"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-field"
              placeholder="seu.email@exemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Telefone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="input-field"
              placeholder="Ex: 841234567"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary modal-submit" 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Pagar Agora'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
