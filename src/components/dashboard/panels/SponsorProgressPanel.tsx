'use client';

import Link from 'next/link';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Target, Building2, Clock, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSponsorStore } from '@/store/sponsorStore';

const SPONSOR_GOAL = 100;

export default function SponsorProgressPanel() {
  const sponsors = useSponsorStore((s) => s.sponsors);

  const active = sponsors.filter((s) => s.status === 'active');
  const pending = sponsors.filter((s) => s.status === 'pending');
  const pct = Math.min(Math.round((active.length / SPONSOR_GOAL) * 100), 100);
  const totalAmount = active.reduce((sum, s) => sum + s.amount, 0);

  // Upcoming contacts
  const upcomingContacts = sponsors
    .filter((s) => {
      if (!s.nextContactDate || s.status === 'inactive') return false;
      const days = differenceInDays(parseISO(s.nextContactDate), new Date());
      return days >= 0 && days <= 7;
    })
    .sort((a, b) =>
      differenceInDays(parseISO(a.nextContactDate!), new Date()) -
      differenceInDays(parseISO(b.nextContactDate!), new Date())
    )
    .slice(0, 3);

  if (sponsors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-300">
        <Building2 className="w-10 h-10 mb-2" />
        <p className="text-sm">協賛企業データがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700">協賛{SPONSOR_GOAL}社 目標</span>
          </div>
          <span className="text-lg font-bold text-indigo-700">
            {active.length}<span className="text-xs text-gray-400 font-normal"> / {SPONSOR_GOAL}</span>
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-indigo-600 font-medium mt-1 text-right">{pct}% 達成</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-green-700">{active.length}</p>
          <p className="text-xs text-green-600">協賛中</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-yellow-600">{pending.length}</p>
          <p className="text-xs text-yellow-600">検討中</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-2.5 text-center">
          <p className="text-xs font-bold text-indigo-700">
            ¥{totalAmount >= 10000
              ? `${Math.round(totalAmount / 10000)}万`
              : totalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-indigo-600">年間協賛額</p>
        </div>
      </div>

      {/* Upcoming contacts */}
      {upcomingContacts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />今週のコンタクト予定
          </p>
          <div className="space-y-1.5">
            {upcomingContacts.map((s) => {
              const days = differenceInDays(parseISO(s.nextContactDate!), new Date());
              return (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                  <span className="flex-1 truncate text-gray-700">{s.companyName}</span>
                  <span className="text-gray-400 shrink-0">
                    {days === 0 ? '本日' : `${days}日後`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Link
        href="/sponsors"
        className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 pt-1 font-medium"
      >
        協賛企業管理へ <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
