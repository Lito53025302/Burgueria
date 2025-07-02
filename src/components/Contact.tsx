import { Mail, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [storeInfo, setStoreInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStoreInfo() {
      const { data, error } = await supabase
        .from('loja_info')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching store info:', error);
      } else {
        setStoreInfo(data);
      }
      setLoading(false);
    }

    fetchStoreInfo();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica de envio do formulário
    console.log('Form submitted:', { name, email, message });
    // Limpar formulário
    setName('');
    setEmail('');
    setMessage('');
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
    storeInfo.endereco || ''
  )}`;

  if (loading) {
    return <div>Carregando...</div>; // Or a more sophisticated loading spinner
  }

  return (
    <section id="contact" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Contato
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Entre em contato conosco para reservas, eventos ou feedback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Informações de Contato + Mapa */}
          <div className="space-y-8 flex flex-col">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Informações</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <MapPin className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Endereço</p>
                    <p className="text-gray-400">{storeInfo.endereco}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Phone className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Telefone</p>
                    <p className="text-gray-400">(11) 99999-9999</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Mail className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">E-mail</p>
                    <p className="text-gray-400">contato@gourmet.com.br</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Horário de Funcionamento</p>
                    <p className="text-gray-400">{storeInfo.horario_funcionamento}</p>
                  </div>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="mt-8 pt-8 border-t border-gray-700">
                <h4 className="text-white font-medium mb-4">Siga-nos</h4>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                  >
                    <Instagram className="w-6 h-6 text-yellow-400" />
                  </a>
                  <a
                    href="#"
                    className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                  >
                    <Facebook className="w-6 h-6 text-yellow-400" />
                  </a>
                </div>
              </div>
            </div>
            {/* Mapa */}
            <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-gray-700">
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Envie uma Mensagem</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-400 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-400 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="contact-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 resize-none"
                  placeholder="Sua mensagem aqui..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/25 active:scale-95"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
