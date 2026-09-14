import { useState } from 'react';
import { BookOpen, CheckCircle2, PenTool, User, ArrowRight } from 'lucide-react';
import PaymentModal from './PaymentModal';
import SuccessPage from './SuccessPage';
import './App.css';

interface Book {
  id: string;
  title: string;
  price: number;
  coverTextTop: string;
  coverTextMiddle: string;
  coverTextBottom: string;
  description: string;
  badge?: string;
}

const books: Book[] = [
  {
    id: 'manual-cadeia',
    title: 'Manual Para Sobreviver 24 Dias na Cadeia',
    price: 109,
    coverTextTop: 'MANUAL\nPARA\nSOBREVIVER',
    coverTextMiddle: '24 DIAS',
    coverTextBottom: 'NA CADEIA\n\nESCRITO POR:\nMOMADE JÚNIOR',
    description: 'Um relato irónico, realista e inesperadamente divertido sobre o que acontece quando a teoria de sobrevivência encontra um colchão de 5 centímetros de espessura.',
    badge: 'Mais Vendido'
  }
];

function App() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Se o URL contém ?ref=, mostrar a página de sucesso/download
  const paymentRef = new URLSearchParams(window.location.search).get('ref');
  if (paymentRef) {
    return <SuccessPage />;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container header-container">
          <div className="logo">
            <BookOpen size={24} />
            <span>A Gaveta</span>
          </div>
          <nav className="main-nav">
            <a href="#livros">Livros</a>
            <a href="#sobre">Sobre o Autor</a>
            <a href="#newsletter">Fique Atento</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-pattern"></div>
        <div className="container hero-container-simple">
          <div className="hero-content">
            <div className="hero-label">O Arquivo Pessoal</div>
            <h1>Bem-vindo à Gaveta.</h1>
            <p className="hero-subtitle">
              O espaço onde guardo e partilho os meus textos soltos, livros não publicados e devaneios literários. Explora a coleção e tem acesso imediato à minha mente.
            </p>
            <div className="hero-actions">
              <a href="#livros" className="btn-primary">
                Ver Livros <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section id="livros" className="books-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">A Coleção</h2>
            <p className="section-subtitle">Obras disponíveis exclusivamente neste arquivo digital.</p>
          </div>

          <div className="books-grid">
            {books.map(book => (
              <div key={book.id} className="book-card-container">
                {book.badge && <div className="book-badge">{book.badge}</div>}
                <div className="book-showcase">
                  <div className="book-card">
                    <div className="book-cover">
                      <div className="cover-top">
                        {book.coverTextTop.split('\n').map((line, i) => (
                          <h2 key={i}>{line}</h2>
                        ))}
                      </div>
                      <div className="cover-middle">
                        <span className="days">{book.coverTextMiddle}</span>
                      </div>
                      <div className="cover-bottom">
                        {book.coverTextBottom.split('\n').map((line, i) => (
                          <p key={i} style={i === 0 ? { fontSize: '2.8rem', fontFamily: 'Outfit', fontWeight: 900, lineHeight: 0.9, marginBottom: '2rem' } : {}}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p>{book.description}</p>
                  <div className="book-actions">
                    <button className="btn-primary" onClick={() => setSelectedBook(book)}>
                      Comprar Acesso - {book.price} MZN
                    </button>
                  </div>
                  <div className="trust-badges small-badges">
                    <span><CheckCircle2 size={14} /> Pagamento Seguro via Paysuite</span>
                    <span><CheckCircle2 size={14} /> Acesso imediato em PDF</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-icon">
              <User size={48} />
            </div>
            <div className="about-content">
              <h2 className="section-title">Sobre o Momade Júnior</h2>
              <p>
                Escrever sempre foi a minha forma de lidar com o mundo. Ao longo dos anos, acumulei dezenas de rascunhos, manuscritos e ideias que nunca viram a luz do dia através das vias tradicionais de publicação.
              </p>
              <p>
                A "Gaveta" nasceu dessa frustração. Porquê deixar as ideias a ganhar pó num disco rígido quando podem ser partilhadas com quem as quer ler? Aqui, sem intermediários ou editoras, decidi abrir o meu baú e disponibilizar as minhas obras mais cruas e genuínas diretamente para os leitores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="newsletter-section">
        <div className="container">
          <div className="newsletter-box">
            <PenTool size={32} className="newsletter-icon" />
            <h2>Não perca as novidades</h2>
            <p>De vez em quando abro a gaveta para tirar de lá mais um livro. Deixe o seu email para ser o primeiro a saber.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="O seu melhor e-mail..." required className="input-field" />
              <button type="submit" className="btn-primary">
                Subscrever
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="logo">
              <BookOpen size={20} />
              <span>A Gaveta</span>
            </div>
            <p>&copy; {new Date().getFullYear()} Momade Júnior. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {selectedBook && (
        <PaymentModal
          isOpen={true}
          onClose={() => setSelectedBook(null)}
          bookTitle={selectedBook.title}
          bookId={selectedBook.id}
          price={selectedBook.price}
        />
      )}
    </div>
  );
}

export default App;
