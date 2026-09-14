import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

// A PaySuite so redireciona para return_url apos pagamento confirmado.
// Nao e necessario verificar novamente — a presenca de ?ref= ja e a confirmacao.

const PDF_FILE = '/Manual_Para_Sobreviver_24_Dias_na_Cadeia.pdf';

const SuccessPage: React.FC = () => {
  const reference = new URLSearchParams(window.location.search).get('ref');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = PDF_FILE;
    link.download = 'Manual_Para_Sobreviver_24_Dias_na_Cadeia.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-paid">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={64} className="success-icon" />
          </div>
          <h1>Pagamento Confirmado!</h1>
          <p className="success-subtitle">
            O teu livro esta pronto para descarregar. Obrigado pela compra!
          </p>
          {reference && (
            <div className="success-ref">
              Referencia: <code>{reference}</code>
            </div>
          )}

          <button
            id="btn-download"
            className="btn-primary download-btn"
            onClick={handleDownload}
          >
            <Download size={20} /> Descarregar PDF
          </button>

          <p className="download-note">
            Guarda o ficheiro no teu dispositivo.{' '}
            <a href="/">Voltar a loja</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
