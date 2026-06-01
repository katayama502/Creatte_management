'use client';

import { useState, useMemo } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Building2,
  Plus,
  Target,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  MessageSquarePlus,
  Clock,
  CheckCircle2,
  Circle,
  DollarSign,
  FileText,
  CreditCard,
} from 'lucide-react';
import { useSponsorStore } from '@/store/sponsorStore';
import { Sponsor, SponsorContact, SponsorStatus, ContactMethod } from '@/types';
import SponsorModal from '@/components/sponsors/SponsorModal';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────

const SPONSOR_GOAL = 100;

const STATUS_CONFIG: Record<SponsorStatus, { label: string; color: string; dot: string }> = {
  active: { label: '協賛中', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  pending: { label: '検討中', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  inactive: { label: '終了', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};

const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  visit: '訪問',
  email: 'メール',
  phone: '電話',
  other: 'その他',
};

// ─── Progress gauge ───────────────────────────────────────────

function SponsorProgressGauge({ total, active }: { total: number; active: number }) {
  const pct = Math.min(Math.round((active / SPONSOR_GOAL) * 100), 100);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-700">協賛企業 達成状況</h2>
        </div>
        <span className="text-2xl font-bold text-indigo-700">{active}<span className="text-sm text-gray-400 font-normal"> / {SPONSOR_GOAL}社</span></span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-gray-400">
        <span>目標 {SPONSOR_GOAL}社</span>
        <span className="font-semibold text-indigo-600">{pct}% 達成</span>
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50 text-sm">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{active}</p>
          <p className="text-xs text-gray-400">協賛中</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-yellow-600">{total - active}</p>
          <p className="text-xs text-gray-400">検討中/終了</p>
        </div>
        <div className="text-center ml-auto">
          <p className="text-xl font-bold text-gray-900">{SPONSOR_GOAL - active}</p>
          <p className="text-xs text-gray-400">残り目標</p>
        </div>
      </div>
    </div>
  );
}

// ─── Contact Log Form ─────────────────────────────────────────

interface AddContactFormProps {
  sponsorId: string;
  onAdd: (contact: Omit<SponsorContact, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function AddContactForm({ sponsorId, onAdd, onCancel }: AddContactFormProps) {
  const [method, setMethod] = useState<ContactMethod>('visit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [nextAction, setNextAction] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    onAdd({ sponsorId, method, date, summary, nextAction: nextAction || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">方法</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as ContactMethod)}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {Object.entries(CONTACT_METHOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">内容</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          placeholder="やり取りの内容を記録"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">次回アクション</label>
        <input
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="次にやること（任意）"
        />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">キャンセル</button>
        <button type="submit" className="flex-1 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">記録する</button>
      </div>
    </form>
  );
}

// ─── Sponsor card ─────────────────────────────────────────────

interface SponsorCardProps {
  sponsor: Sponsor;
  contacts: SponsorContact[];
  onEdit: (s: Sponsor) => void;
  onDelete: (id: string) => void;
  onAddContact: (contact: Omit<SponsorContact, 'id' | 'createdAt'>) => void;
}

function SponsorCard({ sponsor, contacts, onEdit, onDelete, onAddContact }: SponsorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const st = STATUS_CONFIG[sponsor.status];

  const upcomingContact = sponsor.nextContactDate
    ? differenceInDays(parseISO(sponsor.nextContactDate), new Date())
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{sponsor.companyName}</h3>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', st.color)}>{st.label}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{sponsor.contactName} {sponsor.industry && `· ${sponsor.industry}`}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(sponsor)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(sponsor.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
          {sponsor.amount > 0 && (
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <DollarSign className="w-3 h-3" />¥{sponsor.amount.toLocaleString()}
            </span>
          )}
          {sponsor.contactPhone && (
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{sponsor.contactPhone}</span>
          )}
          {sponsor.contactEmail && (
            <span className="flex items-center gap-1 truncate max-w-[180px]"><Mail className="w-3 h-3" />{sponsor.contactEmail}</span>
          )}
          {sponsor.fliersPlaced && (
            <span className="flex items-center gap-1 text-indigo-600"><FileText className="w-3 h-3" />チラシ設置済</span>
          )}
          {(sponsor.cardsDistributed ?? 0) > 0 && (
            <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" />カード{sponsor.cardsDistributed}枚</span>
          )}
        </div>

        {/* Next contact reminder */}
        {upcomingContact !== null && upcomingContact <= 7 && sponsor.status !== 'inactive' && (
          <div className={cn(
            'mt-2 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg',
            upcomingContact < 0 ? 'bg-red-50 text-red-700' :
            upcomingContact === 0 ? 'bg-orange-50 text-orange-700' :
            'bg-yellow-50 text-yellow-700'
          )}>
            <Clock className="w-3.5 h-3.5" />
            {upcomingContact < 0 ? `${Math.abs(upcomingContact)}日前にコンタクト予定でした` :
             upcomingContact === 0 ? '本日コンタクト予定' :
             `${upcomingContact}日後にコンタクト予定`}
            （{format(parseISO(sponsor.nextContactDate!), 'M/d', { locale: ja })}）
          </div>
        )}
      </div>

      {/* Expand / Contact log */}
      <div className="border-t border-gray-50">
        <div className="flex">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center justify-between px-4 py-2.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span>活動履歴 ({contacts.length}件)</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => { setExpanded(true); setAddingContact(true); }}
            className="px-3 py-2.5 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors border-l border-gray-50 flex items-center gap-1"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />記録
          </button>
        </div>

        {expanded && (
          <div className="px-4 pb-4">
            {addingContact && (
              <AddContactForm
                sponsorId={sponsor.id}
                onAdd={(c) => { onAddContact(c); setAddingContact(false); }}
                onCancel={() => setAddingContact(false)}
              />
            )}

            {contacts.length === 0 && !addingContact ? (
              <p className="text-xs text-gray-400 text-center py-3">活動履歴がありません</p>
            ) : (
              <div className="space-y-2 mt-2">
                {contacts.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        {format(parseISO(c.date), 'M/d(E)', { locale: ja })} · {CONTACT_METHOD_LABELS[c.method]}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.summary}</p>
                      {c.nextAction && (
                        <p className="text-xs text-indigo-600 mt-0.5">→ {c.nextAction}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────

export default function SponsorsPage() {
  const { sponsors, contacts, addSponsor, updateSponsor, deleteSponsor, addContact, getContactsBySponsor } = useSponsorStore();
  const [filterStatus, setFilterStatus] = useState<SponsorStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | undefined>();

  const activeCount = sponsors.filter((s) => s.status === 'active').length;
  const totalAmount = sponsors.filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return sponsors;
    return sponsors.filter((s) => s.status === filterStatus);
  }, [sponsors, filterStatus]);

  // Upcoming contacts (within 7 days)
  const upcomingContacts = sponsors.filter((s) => {
    if (!s.nextContactDate || s.status === 'inactive') return false;
    const days = differenceInDays(parseISO(s.nextContactDate), new Date());
    return days >= 0 && days <= 7;
  }).length;

  function handleSave(data: Omit<Sponsor, 'id' | 'createdAt'>) {
    if (editingSponsor) {
      updateSponsor(editingSponsor.id, data);
    } else {
      addSponsor(data);
    }
    setModalOpen(false);
    setEditingSponsor(undefined);
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">協賛企業管理</h1>
            </div>
            <p className="text-sm text-gray-500">全 {sponsors.length} 社</p>
          </div>
          <button
            onClick={() => { setEditingSponsor(undefined); setModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            企業を追加
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />協賛中 {activeCount}社
          </span>
          {totalAmount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-xs">
              <TrendingUp className="w-3.5 h-3.5" />年間協賛額 ¥{totalAmount.toLocaleString()}
            </span>
          )}
          {upcomingContacts > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium text-xs">
              <Clock className="w-3.5 h-3.5" />今週コンタクト予定 {upcomingContacts}社
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Progress gauge */}
        <SponsorProgressGauge total={sponsors.length} active={activeCount} />

        {/* Filter */}
        <div className="flex items-center gap-2">
          {(['all', 'active', 'pending', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                filterStatus === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {s === 'all' ? 'すべて' : STATUS_CONFIG[s].label}
              {s !== 'all' && (
                <span className="ml-1 opacity-70">
                  {sponsors.filter((sp) => sp.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Building2 className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">協賛企業がありません</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 text-sm text-indigo-600 hover:underline"
            >
              最初の企業を追加する
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((sponsor) => (
              <SponsorCard
                key={sponsor.id}
                sponsor={sponsor}
                contacts={getContactsBySponsor(sponsor.id)}
                onEdit={(s) => { setEditingSponsor(s); setModalOpen(true); }}
                onDelete={deleteSponsor}
                onAddContact={addContact}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <SponsorModal
          sponsor={editingSponsor}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingSponsor(undefined); }}
        />
      )}
    </div>
  );
}
