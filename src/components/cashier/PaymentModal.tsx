import { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import { X, Banknote, CreditCard, Wallet } from 'lucide-react'

interface Props {
  total: number
  onConfirm: (method: string, amountPaid: number) => void
  onClose: () => void
  loading: boolean
}

const paymentMethods = [
  { id: 'cash', label: 'Tunai', icon: Banknote },
  { id: 'transfer', label: 'Transfer', icon: CreditCard },
  { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
]

export default function PaymentModal({ total, onConfirm, onClose, loading }: Props) {
  const [method, setMethod] = useState('cash')
  const [amountPaid, setAmountPaid] = useState('')

  const paid = Number(amountPaid) || 0
  const change = paid - total

  const quickAmounts = [total, 50000, 100000, 200000].filter((v, i, a) => a.indexOf(v) === i)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Proses Pembayaran</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Total */}
          <div className="bg-indigo-50 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-indigo-400 font-medium">TOTAL PEMBAYARAN</p>
            <p className="text-3xl font-bold text-indigo-700 mt-1">{formatRupiah(total)}</p>
          </div>

          {/* Metode */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Metode Bayar</p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${
                    method === id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Jumlah Bayar (hanya untuk tunai) */}
          {method === 'cash' && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Jumlah Dibayar</p>
              <input
                type="number"
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                placeholder="Masukkan nominal..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {/* Quick amount */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {quickAmounts.map(a => (
                  <button
                    key={a}
                    onClick={() => setAmountPaid(String(a))}
                    className="text-xs px-2.5 py-1 bg-gray-100 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                  >
                    {formatRupiah(a)}
                  </button>
                ))}
              </div>

              {/* Kembalian */}
              {paid >= total && (
                <div className="mt-3 bg-green-50 rounded-lg px-3 py-2 flex justify-between items-center">
                  <span className="text-xs text-green-600 font-medium">Kembalian</span>
                  <span className="text-sm font-bold text-green-700">{formatRupiah(change)}</span>
                </div>
              )}
              {paid > 0 && paid < total && (
                <div className="mt-3 bg-red-50 rounded-lg px-3 py-2 flex justify-between items-center">
                  <span className="text-xs text-red-500 font-medium">Kurang</span>
                  <span className="text-sm font-bold text-red-600">{formatRupiah(total - paid)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tombol Bayar */}
        <div className="px-5 pb-5">
          <button
            onClick={() => onConfirm(method, method === 'cash' ? paid : total)}
            disabled={loading || (method === 'cash' && paid < total)}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Memproses...' : `Bayar ${formatRupiah(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}