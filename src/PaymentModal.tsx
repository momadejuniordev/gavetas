import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  bookId: string;
  price: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bookTitle, bookId, price }) => {
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
      const reference = `LIVRO${Date.now()}`;
      const returnUrl = `${window.location.origin}${window.location.pathname}?ref=${reference}`;

      // 1. Guardar a compra no Supabase com estado "pending"
      const { error: dbError } = await supabase.from('purchases').insert({
        reference,
        book_id: bookId,
        customer_email: formData.email,
        customer_name: formData.name,
        amount: price,
        status: 'pending',
      });

      if (dbError) {
        console.error('Erro ao guardar compra:', dbError);
        // Continuamos mesmo assim para não bloquear o pagamento
      }

      // 2. Criar o pagamento na PaySuite através da Edge Function
      // (a chave secreta da PaySuite fica apenas no servidor)
      const { data, error } = await supabase.functions.invoke('createPayment', {
        body: {
          amount: price,
          reference,
          description: `Pagamento para ${bookTitle}`,
          return_url: returnUrl,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        },
      });

      if (error) {
        let message = error.message || 'Ocorreu um erro ao processar o pagamento.';
        try {
          const ctx = (error as { context?: Response }).context;
          if (ctx) {
            const parsed = await ctx.json();
            if (parsed?.error || parsed?.message) message = parsed.error || parsed.message;
          }
        } catch {
          // mantém a mensagem original
        }
        throw new Error(message);
      }

      // A função devolve a resposta da PaySuite: { status: "success", data: { checkout_url } }
      if (data?.status === 'success' && data?.data?.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else {
        const msg = data?.message || data?.error || 'Ocorreu um erro ao processar o pagamento.';
        setError(msg);
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
