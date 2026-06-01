import { formatRupiah } from '@/lib/utils'
import { Minus, Plus, Trash2 } from 'lucide-react'

export interface CartItemType {
  id: string
  name: string
  price: number
  quantity: number
  stock: number
}

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItemType
  onIncrease: (id: string) => void
  onDecrease: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
        <p className="text-xs text-indigo-600 font-semibold mt-0.5">{formatRupiah(item.price)}</p>
      </div>

      {/* Qty Control */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onDecrease(item.id)}
          className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
        >
          <Minus size={11} />
        </button>
        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => onIncrease(item.id)}
          disabled={item.quantity >= item.stock}
          className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[72px]">
        <p className="text-sm font-bold text-gray-800">{formatRupiah(item.price * item.quantity)}</p>
      </div>

      {/* Hapus */}
      <button
        onClick={() => onRemove(item.id)}
        className="text-gray-300 hover:text-red-400 transition-colors"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}