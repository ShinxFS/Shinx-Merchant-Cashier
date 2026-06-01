'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'
import { TrendingUp, ShoppingCart, Package } from 'lucide-react'

export default function ReportsPage() {
  const supabase = createClient()
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d
      })

      const weeklyResult = await Promise.all(days.map(async (day) => {
        const start = new Date(day); start.setHours(0, 0, 0, 0)
        const end = new Date(day); end.setHours(23, 59, 59, 999)
        const { data } = await supabase
          .from('transactions')
          .select('total')
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
        return {
          label: day.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
          revenue: data?.reduce((s, t) => s + t.total, 0) ?? 0,
          transactions: data?.length ?? 0,
        }
      }))

      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return d
      })

      const monthlyResult = await Promise.all(months.map(async (month) => {
        const start = new Date(month.getFullYear(), month.getMonth(), 1)
        const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59)
        const { data } = await supabase
          .from('transactions')
          .select('total')
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
        return {
          label: month.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
          revenue: data?.reduce((s, t) => s + t.total, 0) ?? 0,
          transactions: data?.length ?? 0,
        }
      }))

      const { data: items } = await supabase
        .from('transaction_items')
        .select('product_name, quantity, subtotal')

      const productMap: Record<string, { qty: number; revenue: number }> = {}
      items?.forEach(item => {
        if (!productMap[item.product_name]) productMap[item.product_name] = { qty: 0, revenue: 0 }
        productMap[item.product_name].qty += item.quantity
        productMap[item.product_name].revenue += item.subtotal
      })

      const top = Object.entries(productMap)
        .map(([name, val]) => ({ name, ...val }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)

      setWeeklyData(weeklyResult)
      setMonthlyData(monthlyResult)
      setTopProducts(top)
      setLoading(false)
    }
    load()
  }, [])

  const chartData = view === 'weekly' ? weeklyData : monthlyData
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0)
  const totalTransactions = chartData.reduce((s, d) => s + d.transactions, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Memuat laporan...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Laporan Penjualan</h1>

      <div className="flex gap-2">
        {(['weekly', 'monthly'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              view === v
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {v === 'weekly' ? '7 Hari Terakhir' : '6 Bulan Terakhir'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-indigo-500" />
            <p className="text-xs text-gray-500">Total Pendapatan</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatRupiah(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={16} className="text-blue-500" />
            <p className="text-xs text-gray-500">Total Transaksi</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{totalTransactions}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Grafik Pendapatan</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v: any) => `${Number(v) / 1000}k`} />
            <Tooltip
              formatter={(v: any) => [formatRupiah(Number(v)), 'Pendapatan']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Jumlah Transaksi</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
            <Tooltip
              formatter={(v: any) => [v, 'Transaksi']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
            <Line type="monotone" dataKey="transactions" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-purple-500" />
          <h2 className="font-semibold text-gray-800">Produk Terlaris</h2>
        </div>
        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Belum ada data</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const maxQty = topProducts[0]?.qty ?? 1
              return (
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">
                      <span className="text-gray-400 mr-2">#{i + 1}</span>
                      {p.name}
                    </span>
                    <span className="text-gray-500">{p.qty}x · {formatRupiah(p.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(p.qty / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}