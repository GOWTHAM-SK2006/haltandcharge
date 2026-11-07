import React from 'react';
import { TransactionItem } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TransactionsViewProps {
  transactions: TransactionItem[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions }) => {
  const columns: Column<TransactionItem>[] = [
    {
      header: 'Reference UID',
      render: tx => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
          {tx.reference || `#TX-${tx.id}`}
        </span>
      )
    },
    {
      header: 'Customer',
      render: tx => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{tx.user_name || 'Customer'}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{tx.user_email}</div>
        </div>
      )
    },
    {
      header: 'Location / Hub',
      render: tx => (
        <span style={{ color: '#475569' }}>
          {tx.station_name || 'Network Station'}
        </span>
      )
    },
    {
      header: 'Flow Type',
      render: tx => {
        const isDebit = tx.transaction_type === 'DEBIT';
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: isDebit ? '#fff1f2' : '#ecfdf5',
            color: isDebit ? '#be123c' : '#059669'
          }}>
            {isDebit ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
            {tx.transaction_type}
          </span>
        );
      }
    },
    {
      header: 'Purpose',
      render: tx => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
          {tx.purpose || 'CHARGING_SESSION'}
        </span>
      )
    },
    {
      header: 'Amount',
      render: tx => (
        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
          ₹{Number(tx.amount).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Timestamp',
      render: tx => (
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {new Date(tx.created_at).toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div>
      <DataTable
        data={transactions}
        columns={columns}
        keyExtractor={tx => tx.id}
        searchPlaceholder="Search transactions by reference, customer email, or station..."
        searchFilter={(tx, q) =>
          tx.reference.toLowerCase().includes(q) ||
          tx.user_email.toLowerCase().includes(q) ||
          (tx.station_name && tx.station_name.toLowerCase().includes(q))
        }
        filterOptions={[
          { label: 'All Transactions', value: 'ALL', filterFn: () => true },
          { label: 'Debits (Charging)', value: 'DEBIT', filterFn: tx => tx.transaction_type === 'DEBIT' },
          { label: 'Credits (Top-up)', value: 'CREDIT', filterFn: tx => tx.transaction_type === 'CREDIT' }
        ]}
        emptyTitle="No financial transactions found"
        emptyDescription="Billing deductions and charging transactions appear here once customer charging sessions complete."
      />
    </div>
  );
};
