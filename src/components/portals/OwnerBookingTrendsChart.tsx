import React, { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import { PlatformBooking } from '../../data/platformData';
import { WASLA_BRAND } from '../../constants/brand';

interface OwnerBookingTrendsChartProps {
  bookings: PlatformBooking[];
  commissionRate: number;
}

interface DailyPoint {
  dateIso: string;
  label: string;
  bookingsCount: number;
  cancelledCount: number;
  guestsCount: number;
  grossEur: number;
  commissionEur: number;
  netSupplierEur: number;
}

export const OwnerBookingTrendsChart: React.FC<OwnerBookingTrendsChartProps> = ({
  bookings,
  commissionRate,
}) => {
  const [chartMode, setChartMode] = useState<'revenue' | 'volume'>('revenue');
  const [windowMode, setWindowMode] = useState<'smart30' | 'trailing30'>('smart30');

  const { dailySeries, summary, destinationShares } = useMemo(() => {
    const validBookings = bookings.filter((b) => /^\d{4}-\d{2}-\d{2}$/.test(b.date));

    // Determine anchor date:
    // - 'trailing30': strictly the last 30 calendar days ending today
    // - 'smart30': 30-day window ending on the latest booking date (or today if no bookings)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let endAnchor = new Date(today);
    if (windowMode === 'smart30' && validBookings.length > 0) {
      const sortedDates = validBookings
        .map((b) => b.date)
        .sort((a, b) => a.localeCompare(b));
      const latestIso = sortedDates[sortedDates.length - 1];
      const [y, m, d] = latestIso.split('-').map(Number);
      const latestDate = new Date(y, m - 1, d);
      if (!Number.isNaN(latestDate.getTime())) {
        endAnchor = latestDate;
      }
    }

    const bucketMap: Record<string, DailyPoint> = {};
    const points: DailyPoint[] = [];

    for (let i = 29; i >= 0; i--) {
      const dt = new Date(endAnchor);
      dt.setDate(endAnchor.getDate() - i);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${d}`;
      const shortMonth = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const point: DailyPoint = {
        dateIso: iso,
        label: shortMonth,
        bookingsCount: 0,
        cancelledCount: 0,
        guestsCount: 0,
        grossEur: 0,
        commissionEur: 0,
        netSupplierEur: 0,
      };
      bucketMap[iso] = point;
      points.push(point);
    }

    const destTotals: Record<string, { count: number; grossEur: number }> = {
      Hurghada: { count: 0, grossEur: 0 },
      'Marsa Alam': { count: 0, grossEur: 0 },
      Luxor: { count: 0, grossEur: 0 },
      Cairo: { count: 0, grossEur: 0 },
    };

    for (const bk of validBookings) {
      const bucket = bucketMap[bk.date];
      if (!bucket) continue;

      if (bk.status === 'Cancelled' || bk.status === 'Refunded' || bk.status === 'No show') {
        bucket.cancelledCount += 1;
        continue;
      }

      const pax = (bk.adults || 0) + (bk.children || 0) + (bk.infants || 0);
      const gross = Math.max(0, Number(bk.grossEur) || 0);
      const comm = Math.round(gross * (commissionRate / 100));
      const net = gross - comm;

      bucket.bookingsCount += 1;
      bucket.guestsCount += pax;
      bucket.grossEur += gross;
      bucket.commissionEur += comm;
      bucket.netSupplierEur += net;

      const destKey = destTotals[bk.destination] ? bk.destination : 'Hurghada';
      destTotals[destKey].count += 1;
      destTotals[destKey].grossEur += gross;
    }

    const totalBookings = points.reduce((acc, p) => acc + p.bookingsCount, 0);
    const totalCancelled = points.reduce((acc, p) => acc + p.cancelledCount, 0);
    const totalGuests = points.reduce((acc, p) => acc + p.guestsCount, 0);
    const totalGrossEur = points.reduce((acc, p) => acc + p.grossEur, 0);
    const totalCommissionEur = points.reduce((acc, p) => acc + p.commissionEur, 0);
    const peakDay = points.reduce(
      (best, cur) => (cur.grossEur > best.grossEur ? cur : best),
      points[0]
    );

    const destArray = Object.entries(destTotals).map(([dest, stats]) => ({
      destination: dest,
      count: stats.count,
      grossEur: stats.grossEur,
      pct: totalGrossEur > 0 ? Math.round((stats.grossEur / totalGrossEur) * 100) : 0,
    }));

    return {
      dailySeries: points,
      summary: {
        totalBookings,
        totalCancelled,
        totalGuests,
        totalGrossEur,
        totalCommissionEur,
        peakDayLabel: peakDay && peakDay.grossEur > 0 ? `${peakDay.label} (€${peakDay.grossEur})` : '—',
        rangeLabel:
          points.length > 0 ? `${points[0].label} – ${points[points.length - 1].label}` : '',
      },
      destinationShares: destArray,
    };
  }, [bookings, commissionRate, windowMode]);

  return (
    <div className="card-wasla p-5 sm:p-6 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#C8C2B8]/50 dark:border-[#334155] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#EE5426]">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            <span>30-Day Booking &amp; Revenue Trends · تحليل اتجاهات الحجوزات (30 يوماً)</span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-[#0F2233]">
            Daily Bookings, Guest Volume &amp; Commission Trajectory ({summary.rangeLabel})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Window Mode Toggle */}
          <div className="inline-flex rounded-lg border border-[#C8C2B8] bg-[#FAF4ED] p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setWindowMode('smart30')}
              className={`rounded-md px-2.5 py-1.5 transition-colors cursor-pointer ${
                windowMode === 'smart30'
                  ? 'bg-[#0F2233] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F2233]'
              }`}
            >
              Active 30-Day Window
            </button>
            <button
              type="button"
              onClick={() => setWindowMode('trailing30')}
              className={`rounded-md px-2.5 py-1.5 transition-colors cursor-pointer ${
                windowMode === 'trailing30'
                  ? 'bg-[#0F2233] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F2233]'
              }`}
            >
              Last 30 Calendar Days
            </button>
          </div>

          {/* Metric View Toggle */}
          <div className="inline-flex rounded-lg border border-[#EE5426]/30 bg-[#FAF4ED] p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setChartMode('revenue')}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
                chartMode === 'revenue'
                  ? 'bg-[#EE5426] text-white shadow-xs'
                  : 'text-[#0F2233] hover:text-[#EE5426]'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Revenue &amp; Commission (€)</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('volume')}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
                chartMode === 'volume'
                  ? 'bg-[#EE5426] text-white shadow-xs'
                  : 'text-[#0F2233] hover:text-[#EE5426]'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Bookings &amp; Guests (Pax)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#C8C2B8]/60 bg-[#FAF4ED] p-3.5 space-y-0.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B]">
            <span>30-Day Active Bookings</span>
            <Calendar className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
          </div>
          <div className="text-xl font-bold text-[#0F2233] tabular-nums">
            {summary.totalBookings}
          </div>
          <div className="text-[11px] text-[#64748B] tabular-nums">
            {summary.totalCancelled} cancelled / no-show
          </div>
        </div>

        <div className="rounded-lg border border-[#C8C2B8]/60 bg-[#FAF4ED] p-3.5 space-y-0.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B]">
            <span>Total Guests (Pax)</span>
            <Users className="h-3.5 w-3.5 text-[#19354F]" aria-hidden="true" />
          </div>
          <div className="text-xl font-bold text-[#0F2233] tabular-nums">
            {summary.totalGuests}
          </div>
          <div className="text-[11px] text-[#64748B] tabular-nums">
            Avg{' '}
            {summary.totalBookings > 0
              ? (summary.totalGuests / summary.totalBookings).toFixed(1)
              : '0.0'}{' '}
            pax / booking
          </div>
        </div>

        <div className="rounded-lg border border-[#EE5426]/30 bg-[#FAF4ED] p-3.5 space-y-0.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#D9461B]">
            <span>30-Day Gross Volume</span>
            <DollarSign className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
          </div>
          <div className="text-xl font-bold text-[#0F2233] tabular-nums">
            €{summary.totalGrossEur}
          </div>
          <div className="text-[11px] text-[#D9461B] tabular-nums truncate">
            Peak: {summary.peakDayLabel}
          </div>
        </div>

        <div className="rounded-lg border border-[#10B981]/35 bg-[#FAF4ED] p-3.5 space-y-0.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#10B981]">
            <span>30-Day Net Commission ({commissionRate}%)</span>
            <TrendingUp className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
          </div>
          <div className="text-xl font-bold text-[#0F2233] tabular-nums">
            €{summary.totalCommissionEur}
          </div>
          <div className="text-[11px] text-[#64748B] tabular-nums">
            Supplier Net: €{summary.totalGrossEur - summary.totalCommissionEur}
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization */}
      <div className="h-72 sm:h-80 w-full rounded-xl border border-[#C8C2B8]/50 bg-[#FAF4ED]/60 p-3 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'revenue' ? (
            <ComposedChart data={dailySeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="waslaGrossFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={WASLA_BRAND.colors.orange} stopOpacity={0.32} />
                  <stop offset="95%" stopColor={WASLA_BRAND.colors.orange} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={WASLA_BRAND.colors.dividerLight} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: WASLA_BRAND.colors.mutedText }}
                tickLine={false}
                axisLine={{ stroke: WASLA_BRAND.colors.dividerLight }}
                minTickGap={18}
              />
              <YAxis
                tickFormatter={(v) => `€${v}`}
                tick={{ fontSize: 11, fill: WASLA_BRAND.colors.mutedText }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: WASLA_BRAND.colors.white,
                  borderColor: WASLA_BRAND.colors.dividerLight,
                  borderRadius: '10px',
                  fontSize: '12px',
                  boxShadow: '0 8px 24px rgba(15, 34, 51, 0.08)',
                }}
                formatter={(value: unknown, name: unknown) => [
                  `€${Number(value) || 0}`,
                  String(name || ''),
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="grossEur"
                name="Gross Sales (€)"
                stroke={WASLA_BRAND.colors.orange}
                strokeWidth={2.5}
                fill="url(#waslaGrossFill)"
              />
              <Bar
                dataKey="commissionEur"
                name={`Platform Commission (${commissionRate}%)`}
                fill={WASLA_BRAND.colors.success}
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={dailySeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="waslaGuestsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={WASLA_BRAND.colors.navyLight} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={WASLA_BRAND.colors.navyLight} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={WASLA_BRAND.colors.dividerLight} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: WASLA_BRAND.colors.mutedText }}
                tickLine={false}
                axisLine={{ stroke: WASLA_BRAND.colors.dividerLight }}
                minTickGap={18}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: WASLA_BRAND.colors.mutedText }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: WASLA_BRAND.colors.white,
                  borderColor: WASLA_BRAND.colors.dividerLight,
                  borderRadius: '10px',
                  fontSize: '12px',
                  boxShadow: '0 8px 24px rgba(15, 34, 51, 0.08)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="guestsCount"
                name="Total Guests (Pax)"
                stroke={WASLA_BRAND.colors.navyLight}
                strokeWidth={2.2}
                fill="url(#waslaGuestsFill)"
              />
              <Bar
                dataKey="bookingsCount"
                name="Confirmed/Active Bookings"
                fill={WASLA_BRAND.colors.orange}
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
              />
              <Bar
                dataKey="cancelledCount"
                name="Cancelled / No-Show"
                fill={WASLA_BRAND.colors.danger}
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Destination Revenue Share Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {destinationShares.map((item) => (
          <div
            key={item.destination}
            className="rounded-lg border border-[#C8C2B8]/60 bg-[#FAF4ED] px-3 py-2 flex items-center justify-between gap-2 text-xs"
          >
            <div className="min-w-0">
              <div className="font-semibold text-[#0F2233] truncate">{item.destination}</div>
              <div className="text-[11px] text-[#64748B] tabular-nums">
                {item.count} bookings · €{item.grossEur}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-[#EE5426]/10 border border-[#EE5426]/30 px-2 py-0.5 text-[11px] font-bold text-[#EE5426] tabular-nums">
              {item.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
