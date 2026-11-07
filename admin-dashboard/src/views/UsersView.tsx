import React, { useState } from 'react';
import { User } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  onDeleteUser: (userId: number, name: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, onDeleteUser }) => {
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);

  const customerList = users.filter(u => u.role !== 'ROLE_ADMIN' && u.email !== 'admin@haltcharge.com');

  const columns: Column<User>[] = [
    {
      header: 'ID',
      render: u => <span style={{ fontWeight: 700, color: '#64748b' }}>#{u.id}</span>,
      width: '70px'
    },
    {
      header: 'Customer Name',
      render: u => (
        <div style={{ fontWeight: 700, color: '#0f172a' }}>
          {u.fullName || 'Customer'}
        </div>
      )
    },
    {
      header: 'Email Address',
      accessor: 'email'
    },
    {
      header: 'System Role',
      render: u => (
        <span style={{ fontFamily: 'monospace', fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
          {u.role}
        </span>
      )
    },
    {
      header: 'Account Status',
      render: u => (
        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          background: u.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
          color: u.status === 'ACTIVE' ? '#059669' : '#dc2626',
          border: u.status === 'ACTIVE' ? '1px solid #a7f3d0' : '1px solid #fecaca'
        }}>
          {u.status}
        </span>
      )
    },
    {
      header: 'Wallet Balance',
      render: u => (
        <span style={{ fontWeight: 700, color: '#059669', fontSize: '13px' }}>
          ₹{Number(u.walletBalance).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: u => (
        <button
          onClick={() => setConfirmDeleteUser(u)}
          title="Permanently Delete User"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
          onMouseLeave={e => (e.currentTarget.style.background = '#fef2f2')}
        >
          <Trash2 size={13} />
          <span>Delete</span>
        </button>
      )
    }
  ];

  return (
    <div>
      <DataTable
        data={customerList}
        columns={columns}
        keyExtractor={u => u.id}
        searchPlaceholder="Search customers by name or email..."
        searchFilter={(u, q) =>
          u.email.toLowerCase().includes(q) ||
          (u.fullName && u.fullName.toLowerCase().includes(q))
        }
        filterOptions={[
          { label: 'All Customers', value: 'ALL', filterFn: () => true },
          { label: 'Active', value: 'ACT', filterFn: u => u.status === 'ACTIVE' },
          { label: 'Suspended', value: 'SUS', filterFn: u => u.status !== 'ACTIVE' }
        ]}
        emptyTitle="No registered customers found"
        emptyDescription="Registered users who sign up through the mobile or web app will appear here."
      />

      {/* Delete Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="modal-overlay">
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Permanently Delete User?
            </h3>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
              Are you sure you want to permanently delete customer <strong>{confirmDeleteUser.fullName || confirmDeleteUser.email}</strong>?
            </p>

            <div style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#9f1239',
              marginBottom: '20px'
            }}>
              ⚠️ <strong>Cascade Deletion Notice:</strong> All associated vehicles, charging history, slot bookings, notifications, and support tickets for this user will be permanently removed from the database.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setConfirmDeleteUser(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const uid = confirmDeleteUser.id;
                  const name = confirmDeleteUser.fullName || confirmDeleteUser.email;
                  setConfirmDeleteUser(null);
                  onDeleteUser(uid, name);
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                }}
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

