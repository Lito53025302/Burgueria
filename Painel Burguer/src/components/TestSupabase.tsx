import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function TestSupabase() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testFetch = async () => {
    setLoading(true);
    setResult('');
    try {
      const { data, error } = await supabase.from('orders').select('*').limit(1);
      if (error) {
        setResult('Erro: ' + error.message);
      } else {
        setResult('Sucesso: ' + JSON.stringify(data));
      }
    } catch (err: any) {
      setResult('Exception: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ margin: 16, padding: 16, border: '1px solid #ccc' }}>
      <button onClick={testFetch} disabled={loading} style={{ padding: 8, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}>
        {loading ? 'Testando...' : 'Testar conexão Supabase'}
      </button>
      <div style={{ marginTop: 12, wordBreak: 'break-all' }}>{result}</div>
    </div>
  );
}
