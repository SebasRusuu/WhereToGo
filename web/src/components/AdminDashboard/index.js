import React from 'react';
import './styles.css'; // Supondo que você tenha um arquivo CSS específico para o AdminDashboard

const AdminDashboard = () => {
  const metrics = [
    { title: 'Utilizadores Registrados', value: 2 },
    { title: 'Total de Roteiros', value: '28' },
    { title: 'Utilizadores Ativos', value: 1 },
  ];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com',roteiros: '10', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com',roteiros: '18', status: 'Inactive' },
    // Adicione mais linhas conforme necessário
  ];

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="metrics">
        {metrics.map((metric, index) => (
          <div key={index} className="metrics-card">
            <h3>{metric.title}</h3>
            <p>{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="tables">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Nº de Roteiros</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.roteiros}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
