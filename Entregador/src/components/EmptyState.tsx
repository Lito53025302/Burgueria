import React from 'react';

export const EmptyState: React.FC<{ type: 'delivery' | 'orders' }> = ({ type }) => {
  if (type === 'delivery') {
    return (
      <div className="text-center text-gray-400">
        <p>Nenhuma entrega em andamento.</p>
      </div>
    );
  }
  return (
    <div className="text-center text-gray-400">
      <p>Não há pedidos prontos para coleta.</p>
    </div>
  );
};
