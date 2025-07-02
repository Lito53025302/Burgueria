import React, { useState } from 'react';

export function RegisterEntregador() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    // Chama a API backend para criar entregador
    try {
      const res = await fetch('http://localhost:3333/create-entregador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar entregador');
      setSuccess(true);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
      <h2 className="text-xl font-bold text-center">Cadastrar Entregador</h2>
      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      {success && <div className="text-green-600 text-sm text-center">Entregador cadastrado com sucesso!</div>}
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded font-semibold disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  );
}
