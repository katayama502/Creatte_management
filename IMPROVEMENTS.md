# クリエット スクール管理システム 改善提案書

> 作成日: 2026年5月29日  
> 対象システム: クリエット音楽スクール管理システム (coffee-airboat ブランチ)  
> 作成者: 分析エージェント

---

## 競合サービス調査結果

### 国内主要競合サービス

| サービス名 | 提供元 | 主要特徴 |
|---|---|---|
| **スクールマネージャー** | 株式会社スクールマネージャー | 月謝自動引落、出席QRコード、LINE通知連携 |
| **Comiru（コミル）** | ポラリス株式会社 | 保護者アプリ連携、請求自動化、欠席連絡デジタル化 |
| **スクールウィズ** | 各種SaaS | 振替管理、レッスンノート、生徒ポートフォリオ |
| **Kawaiiスクール管理** | カワイ音楽教室系統 | 楽器別進捗管理、発表会管理、グループレッスン対応 |
| **楽器店・音楽教室向けPOS** | 各社 | 楽器販売連携、楽譜販売、レンタル管理 |

### 海外主要競合サービス

| サービス名 | 提供元 | 主要特徴 |
|---|---|---|
| **Jackrabbit Music** | Jackrabbit Technologies | 自動請求、出席追跡、保護者ポータル、メール一括送信 |
| **Teachworks** | Teachworks Inc. | レッスンノート、進捗追跡、宿題管理、保護者/生徒向けポータル |
| **Music Teacher's Helper** | Aria Music Technologies | 月謝請求、レッスン履歴、宿題追跡、保護者連絡ログ |
| **MyStudio** | MyStudio | 自動課金、デジタル契約書、出欠SMS通知、振替システム |
| **iClassPro** | iClassPro | スケジュール最適化、ウェイトリスト管理、レポート生成 |
| **Studio Director** | The Studio Director | 在籍/退会追跡、家族アカウント、請求書PDFエクスポート |

### 競合サービスで共通して提供されている機能（現システムに不足）

1. **出席の○/×管理** — レッスン単位での出席記録・欠席理由入力
2. **月謝請求ステータス管理** — 未払い/支払済/自動引落の可視化、督促アラート
3. **振替レッスン申請・管理** — キャンセル時の振替枠の申請・承認ワークフロー
4. **レッスンメモ・進捗記録** — 各レッスン後の教師コメント・宿題・進捗入力
5. **保護者連絡ログ** — 電話・メール・LINEでの連絡履歴を時系列で記録
6. **グローバル検索** — 生徒名・電話番号・メール横断的な即時検索
7. **アクションアラート通知** — 月謝未払い・体験後フォローアップ未対応の通知
8. **CSVエクスポート** — 生徒一覧・月謝一覧・出席データのエクスポート
9. **印刷対応フォーム** — 入会申し込み書の印刷レイアウト最適化
10. **モバイルファースト対応** — スマートフォンからの操作に最適化されたUI

---

## 現システムの分析

### 技術スタック

- **フレームワーク**: Next.js 14 (App Router) + TypeScript
- **状態管理**: Zustand（クライアントサイドのみ、永続化なし）
- **スタイリング**: Tailwind CSS + clsx + tailwind-merge
- **フォームバリデーション**: react-hook-form + Zod
- **ドラッグ&ドロップ**: @dnd-kit/core + @dnd-kit/sortable
- **日付処理**: date-fns (ja locale)
- **アイコン**: Lucide React
- **バックエンド**: なし（すべてクライアントサイドのメモリストア）

### 実装済みページ・機能

| ページ | 実装状況 |
|---|---|
| `/` ダッシュボード | 4パネル（統計・最近の生徒・直近レッスン・講師稼働）+ D&D並び替え |
| `/students` 生徒管理 | カンバンビュー（D&D対応）+ リストビュー（ソート・フィルター） |
| `/enrollment` 入会申し込み | 未提出/提出済みタブ + Zodバリデーション付きフォーム + 印刷ボタン |
| `/schedule` スケジュール | 月次カレンダー + 週次講師ビュー（D&D）+ 生徒ビュー |
| `/teachers` 講師管理 | 講師カード + 追加/編集モーダル |

### 強み

1. **モダンな技術選定** — Next.js App Router + Zustand + Zod + dnd-kit の組み合わせは保守性が高い
2. **直感的なカンバンUI** — 体験待ち→体験済み→入会手続き中→受講中→休会のフロー可視化が優れている
3. **ドラッグ&ドロップ** — 生徒ステータス変更・スケジュール移動・ダッシュボード並び替えがDnDで操作できる
4. **スケジュール3ビュー** — カレンダー/講師/生徒の3視点が揃っている
5. **入会フォームの品質** — Zodバリデーション・コース選択UI・利用規約同意が実装済み
6. **週次ドラッグスケジュール** — 講師ビューでのレッスンブロック移動が実装済み
7. **コンポーネント設計** — pages / components / store / types の分離が明確
8. **日本語ファースト** — 日付・曜日・ステータスラベルが全て日本語対応
9. **レスポンシブ対応の基礎** — Tailwind の sm/md/lg ブレークポイントが使われている
10. **サイドバー折りたたみ** — コンパクト表示に対応済み

### 弱み・不足機能

#### データ永続化の欠如
- **全データがメモリ上のみ** — ページリロードで全データが失われる
- Zustand の `persist` middleware やバックエンドAPI連携が未実装
- 複数端末・複数スタッフでの同時利用が不可能

#### 出席管理の欠如
- `Lesson.status` に `completed` はあるが、出席/欠席の区別がない
- 欠席理由・連絡有無を記録するフィールドが存在しない
- 月次出席率レポートが計算できない

#### 月謝・支払い管理の欠如
- `EnrollmentForm` にコース料金（¥8,000〜¥27,000）が表示されているが、請求データモデルが存在しない
- 支払いステータス（未払い/支払済/口座引落）の追跡が不可能
- 月謝未払い督促アラートが存在しない

#### 振替レッスン管理の欠如
- 利用規約に「振替レッスンは月1回まで」と記載されているが、振替申請・管理機能が存在しない
- キャンセルされたレッスンへの振替紐付けが不可能

#### レッスンメモ・進捗管理の欠如
- `Lesson.notes` フィールドは存在するが、AddLessonModal では入力できるのみで閲覧UIが貧弱
- 生徒ごとの進捗履歴・宿題・楽曲進捗を記録する仕組みがない

#### 保護者連絡ログの欠如
- 電話・メール・LINEでの連絡を記録するデータモデルが存在しない
- 「体験後フォローアップ」「入会検討中の生徒への連絡」を追跡できない

#### 検索・フィルター機能の不足
- グローバル検索（電話番号・メールアドレス横断検索）が存在しない
- 生徒リストの `searchQuery` が StudentScheduleView のみに限定されている
- 担当講師・コース頻度での絞り込みが生徒リストにない

#### アラート・通知の欠如
- ヘッダーにベルアイコンはあるが通知リストが実装されていない
- 「体験待ちX日超過」「月謝未払い」「振替月1回上限超過」などのアラートがない

#### エクスポート機能の欠如
- 「今月のレポート」ボタンがダッシュボードにあるが機能が未実装
- CSV・PDF エクスポートが存在しない

#### 印刷対応の不足
- `EnrollmentForm` に `window.print()` ボタンはあるが、印刷用CSSスタイルシート（`@media print`）が未実装
- フォームの印刷時にナビゲーション・ボタン・モーダルが含まれてしまう

#### モバイル対応の不足
- カンバンビューは `min-w-[260px]` の固定幅カラムで、スマートフォン幅（375px）では5列が横スクロールになる
- 週次講師ビューは `min-w-[100px]` の7列構造でモバイルでの視認が困難
- テーブルビュー（StudentList）は7カラムでスマートフォン上では横スクロール必須

#### その他
- `/settings` ページへのリンクがサイドバーにあるが、ページが存在しない
- `StudentDetailModal` の「申し込みフォームへ」ボタンがリンクではなく機能なしのボタン
- `Teacher` データモデルに給与・雇用形態・資格の記録フィールドがない
- レッスン定員・グループレッスン対応がない

---

## 優先度別 改善提案

### 🔴 高優先度（すぐに実装すべき）

#### H-1. データ永続化（LocalStorage / Supabase）
**重要度**: システムの実用性に直結する最優先課題  
**現状**: 全データがメモリ上のみ。リロードで消滅。  
**実装方針**:
- **フェーズ1（即時）**: Zustand `persist` middleware + `localStorage` でクライアントサイド永続化
  ```ts
  // store/studentStore.ts
  import { persist } from 'zustand/middleware'
  export const useStudentStore = create(
    persist<StudentState>((set) => ({ ... }), { name: 'kurietto-students' })
  )
  ```
- **フェーズ2（将来）**: Supabase + Next.js Server Actions による本格バックエンド化

---

#### H-2. 出席管理機能（Attendance Tracking）
**重要度**: 競合サービス全てが提供する必須機能  
**現状**: `Lesson.status` が `scheduled/completed/cancelled` の3値のみ  
**実装内容**:
- `Lesson` 型に `attendanceStatus: 'present' | 'absent' | 'late' | null` を追加
- `absenceReason?: string`（欠席理由）フィールドを追加
- `contactedGuardian?: boolean`（保護者連絡済み）フィールドを追加
- スケジュールページのレッスンカードに出席記録ボタンを追加（○/×/遅刻）
- 生徒詳細モーダルに出席率の表示を追加（例: 今月 4/5回 出席）

**型変更**:
```ts
export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'late';

export interface Lesson {
  // ... existing fields
  attendanceStatus?: AttendanceStatus;
  absenceReason?: string;
  contactedGuardian?: boolean;
}
```

---

#### H-3. 月謝・支払い管理（Payment Management）
**重要度**: スクール運営の財務管理に直結  
**現状**: データモデルが存在しない  
**実装内容**:
- `Payment` 型を新規作成（`studentId`, `month`, `amount`, `status`, `paidAt`, `method`）
- `paymentStore.ts` を新規作成
- 生徒管理ページに月謝タブを追加
- 支払いステータスバッジ（未払い:赤 / 支払済:緑 / 自動引落:青）をDashboardに表示
- 未払い件数をヘッダーの通知ベルに連携

**型定義**:
```ts
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'auto_debit';

export interface Payment {
  id: string;
  studentId: string;
  /** YYYY-MM format */
  month: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  method?: 'bank_transfer' | 'cash' | 'credit_card' | 'auto_debit';
  notes?: string;
}
```

---

#### H-4. 通知・アラートシステム（Alert System）
**重要度**: 業務上の見落とし防止  
**現状**: ベルアイコンがあるが未実装  
**実装内容**:
- `useAlerts()` カスタムフックを作成（全ストアを横断してアラートを生成）
- アラート種別と優先度:
  | 種別 | トリガー条件 | 優先度 |
  |---|---|---|
  | 体験フォローアップ未対応 | `trial_completed` 状態で3日以上経過 | 高 |
  | 月謝未払い | `Payment.status === 'overdue'` | 高 |
  | 振替上限超過 | 当月の振替が1回を超えた | 中 |
  | 体験日が本日 | `trialDate === today` | 中 |
  | 入会手続き長期停滞 | `enrolled` 状態で7日以上経過 | 低 |
- ヘッダーのベルアイコンにバッジ数表示
- クリックで通知ドロップダウン（各アラートから該当ページへ遷移）

---

#### H-5. レッスンメモ・進捗記録（Lesson Notes & Progress）
**重要度**: 教師の業務効率と生徒の継続率向上に直結  
**現状**: `Lesson.notes` フィールドはあるがUIが不十分  
**実装内容**:
- レッスンカードをクリックすると詳細/編集モーダルが開く
- モーダル内に以下フィールドを追加:
  - `lessonNotes`: 本日の内容メモ（テキスト）
  - `homeworkNotes`: 宿題（テキスト）
  - `progressTags`: 進捗タグ（例: `['スケール', 'ブルグミュラー第5番', '読譜']`）
  - `nextLessonPlan`: 次回レッスン予定（テキスト）
- 生徒詳細モーダルに「レッスン履歴」タブを追加（最新10件のメモを時系列表示）

---

### 🟡 中優先度

#### M-1. 振替レッスン管理（Makeup Lesson System）
**重要度**: 利用規約に明記されている機能だが実装がない  
**実装内容**:
- `MakeupRequest` 型を新規作成（`originalLessonId`, `requestDate`, `status`, `makeupLessonId`）
- キャンセルされたレッスンカードに「振替を申請」ボタンを追加
- 振替申請一覧ページまたはモーダルで対応中の振替を管理
- 当月の振替回数カウンター（上限1回アラート）
- 振替の紐付け（元キャンセルレッスン ↔ 振替レッスン）

**型定義**:
```ts
export type MakeupStatus = 'pending' | 'scheduled' | 'completed' | 'expired';

export interface MakeupRequest {
  id: string;
  studentId: string;
  originalLessonId: string;
  requestedAt: string;
  status: MakeupStatus;
  makeupLessonId?: string;
  notes?: string;
}
```

---

#### M-2. 保護者連絡ログ（Communication Log）
**重要度**: 体験後フォローアップの追跡・スタッフ間の情報共有に必要  
**実装内容**:
- `ContactLog` 型を新規作成（`studentId`, `date`, `method`, `summary`, `followUpDate`, `staffName`）
- 生徒詳細モーダルに「連絡履歴」タブを追加
- 体験済み・入会手続き中の生徒カードに「連絡を記録」クイックアクションを追加
- ダッシュボードに「フォローアップ必要な生徒」パネルを追加

**型定義**:
```ts
export type ContactMethod = 'phone' | 'email' | 'line' | 'in_person' | 'other';

export interface ContactLog {
  id: string;
  studentId: string;
  date: string;
  method: ContactMethod;
  summary: string;
  followUpDate?: string;
  staffName?: string;
}
```

---

#### M-3. グローバル検索（Global Search）
**重要度**: 生徒数が増えると検索なしでは運用困難  
**現状**: StudentScheduleView に部分的なローカル検索のみ  
**実装内容**:
- ヘッダーに検索バーを追加（`Cmd+K` / `Ctrl+K` ショートカット対応）
- 検索対象: 生徒名・カナ・電話番号・メール・保護者名
- 検索結果は `<StudentDetailModal>` を直接開くか、該当ページへ遷移
- `useGlobalSearch(query: string)` カスタムフックを実装
- デバウンス処理（300ms）で入力中のパフォーマンスを確保

```ts
// hooks/useGlobalSearch.ts
export function useGlobalSearch(query: string) {
  const students = useStudentStore((s) => s.students);
  const teachers = useTeacherStore((s) => s.teachers);
  
  return useMemo(() => {
    if (!query.trim()) return { students: [], teachers: [] };
    const q = query.toLowerCase();
    return {
      students: students.filter(s =>
        s.name.includes(q) || s.nameKana.includes(q) ||
        s.phone.includes(q) || s.email.includes(q) ||
        (s.guardianName ?? '').includes(q)
      ),
      teachers: teachers.filter(t =>
        t.name.includes(q) || t.nameKana.includes(q)
      ),
    };
  }, [query, students, teachers]);
}
```

---

#### M-4. CSVエクスポート（Data Export）
**重要度**: 会計ソフト連携・バックアップ・外部報告に必要  
**現状**: 「今月のレポート」ボタンが未実装  
**実装内容**:
- `src/lib/exportCsv.ts` ユーティリティを作成
- エクスポート対象:
  - **生徒一覧CSV**: 名前・カナ・電話・メール・ステータス・入会日・担当講師・月謝
  - **月次レッスン一覧CSV**: 日付・時間・生徒・講師・出席状況・メモ
  - **月謝請求CSV**: 生徒名・月・金額・支払状況（会計ソフト向け）
- ダッシュボードの「今月のレポート」ボタンに実装
- 生徒リストページに「CSVダウンロード」ボタンを追加

```ts
// lib/exportCsv.ts
export function downloadCsv(rows: Record<string, string>[], filename: string) {
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => `"${(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

#### M-5. 印刷対応スタイルシート（Print Stylesheet）
**重要度**: 紙の入会申し込み書を保護者に渡すために必要  
**現状**: `window.print()` ボタンはあるが印刷用CSSがない  
**実装内容**:
- `globals.css` に `@media print` ルールを追加:
  ```css
  @media print {
    /* サイドバー・ヘッダーを非表示 */
    aside, header, .print\:hidden { display: none !important; }
    
    /* A4縦向き最適化 */
    @page { size: A4 portrait; margin: 15mm; }
    
    /* ページブレーク制御 */
    .bg-white.rounded-xl { break-inside: avoid; }
    
    /* 文字・背景色を印刷向けに調整 */
    body { font-size: 11pt; color: #000; }
    .rounded-xl { border-radius: 0; border: 1px solid #ccc; }
    
    /* チェックボックスを可視化 */
    input[type="checkbox"] { appearance: auto; }
  }
  ```
- `EnrollmentForm` の `print:hidden` クラス（既に付与済み）をボタン以外にも拡張
- 印刷プレビューボタンに「印刷用に最適化されました」トースト通知を追加

---

#### M-6. 生徒詳細ページの強化（Student Detail Enhancement）
**重要度**: 生徒ごとの情報が散在しており一覧性が低い  
**現状**: `StudentDetailModal` がモーダルのみ。レッスン履歴・出席・月謝が見えない  
**実装内容**:
- `/students/[id]` 専用ページを作成
- タブ構成:
  - **基本情報**: 現在のモーダル内容 + 編集フォーム
  - **レッスン履歴**: 全レッスンのタイムライン（出席状況・メモ表示）
  - **支払い履歴**: 月謝一覧（支払済/未払い）
  - **連絡ログ**: 保護者との連絡履歴
- `StudentDetailModal` の「詳細」ボタンをこのページへの遷移に変更

---

### 🟢 低優先度

#### L-1. モバイル最適化（Mobile Responsiveness）
**重要度**: 講師がスマートフォンから操作する場面に対応  
**現状**: レイアウトは基本的にデスクトップ向け  
**実装内容**:
- カンバンビューにモバイル向け代替表示（アコーディオン形式のリストビュー）を追加
- 週次スケジュールビューに「3日表示」モードを追加（モバイル向け）
- 生徒リストテーブルをモバイルでカード表示に変換（`sm:` ブレークポイントで切替）
- `<Header>` の検索バーをモバイルではアイコンのみ → タップで展開する形式に変更

---

#### L-2. 設定ページの実装（Settings Page）
**重要度**: サイドバーにリンクがあるが404エラー  
**実装内容**:
- `/settings` ページを作成
- 設定項目:
  - **スクール情報**: スクール名・住所・電話番号・メール
  - **コース設定**: コース名・月謝金額の編集（現在ハードコードされている）
  - **営業時間**: 受付可能時間帯の設定
  - **通知設定**: アラートの有効/無効・フォローアップ日数の閾値
  - **データ管理**: エクスポート・データ初期化

---

#### L-3. 講師の詳細情報拡張（Teacher Profile Enhancement）
**重要度**: 雇用管理・給与計算の基礎データとして将来必要  
**現状**: `Teacher` 型に基本情報のみ。給与・雇用形態・資格がない  
**実装内容**:
- `Teacher` 型に以下フィールドを追加（任意）:
  ```ts
  employmentType?: 'full_time' | 'part_time' | 'contract';
  hourlyRate?: number;
  qualifications?: string[];
  hireDate?: string;
  bio?: string; // 生徒向け自己紹介文
  ```
- 講師カードに「今月のレッスン数」「担当生徒数」を表示（現在は稼働率のみ）
- 月次レッスン数から自動計算した報酬概算をスタッフ向けに表示

---

#### L-4. ダッシュボードパネルの追加（Dashboard Panel Expansion）
**重要度**: 経営状況の一覧性向上  
**現状**: 4パネル（統計・最近の生徒・直近レッスン・講師稼働）のみ  
**追加候補パネル**:
- **月謝回収状況**: 今月の請求総額 / 回収済み額 / 未回収額
- **体験→入会転換率**: 先月・今月の体験人数と入会人数の比率
- **フォローアップ必要リスト**: 連絡待ち生徒の一覧
- **今日のレッスン**: 本日のレッスンスケジュール（タイムライン形式）

---

#### L-5. グループレッスン対応（Group Lesson Support）
**重要度**: アンサンブル・発表会準備など複数生徒のレッスンが必要  
**現状**: `Lesson` は1対1のみ（`studentId` が単一）  
**実装内容**:
- `Lesson` 型の `studentId` を `studentIds: string[]` に変更（後方互換あり）
- グループレッスン作成時の複数生徒選択UI
- グループ用の出席記録（全員分の○/×）

---

#### L-6. バルクアクション（Bulk Operations）
**重要度**: 月初の月謝一括作成・一斉連絡など  
**実装内容**:
- 生徒リストにチェックボックス追加
- 選択後のアクション: 「月謝を作成」「CSVエクスポート」「一括ステータス変更」
- 月初に `active` の全生徒に対して月謝レコードを一括作成するボタン

---

## 実装予定機能の詳細仕様

### 仕様1: データ永続化（H-1）

**実装ファイル**: 全 `store/*.ts` ファイル

**変更内容**:
```ts
// 各ストアに persist middleware を追加
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      students: SAMPLE_STUDENTS,
      addStudent: ...,
      updateStudent: ...,
      deleteStudent: ...,
      moveStudentStatus: ...,
    }),
    {
      name: 'kurietto-students-v1',
      // バージョン管理で破壊的変更に対応
      version: 1,
    }
  )
);
```

**注意点**:
- `localStorage` の容量上限（5MB）に注意。生徒100名・レッスン1200件/年 程度なら問題なし
- バージョン番号（`version: 1`）を設定し、型変更時にデータをマイグレーションできるようにする
- 将来のSupabase移行時はストアのインターフェースを変えずにバックエンドを差し替え可能にする設計にする

---

### 仕様2: 出席管理（H-2）

**影響ファイル**:
- `src/types/index.ts` — `Lesson` 型拡張
- `src/store/scheduleStore.ts` — `recordAttendance` アクション追加
- `src/components/schedule/LessonCard.tsx` — 出席記録ボタン追加
- `src/components/students/StudentDetailModal.tsx` — 出席率表示追加

**LessonCard の出席記録UI**:
```tsx
// レッスンカード右上に出席記録ボタンを追加
{lesson.status === 'completed' && (
  <div className="flex gap-1">
    <button
      onClick={() => recordAttendance(lesson.id, 'present')}
      className={cn('px-2 py-0.5 text-xs rounded', 
        lesson.attendanceStatus === 'present' 
          ? 'bg-green-500 text-white' 
          : 'bg-gray-100 hover:bg-green-100'
      )}
    >○</button>
    <button
      onClick={() => recordAttendance(lesson.id, 'absent_excused')}
      className={cn('px-2 py-0.5 text-xs rounded',
        lesson.attendanceStatus?.startsWith('absent')
          ? 'bg-red-500 text-white'
          : 'bg-gray-100 hover:bg-red-100'
      )}
    >×</button>
  </div>
)}
```

**生徒詳細での出席率計算**:
```ts
function calcAttendanceRate(lessons: Lesson[], studentId: string): string {
  const completed = lessons.filter(
    l => l.studentId === studentId && l.status === 'completed'
  );
  if (completed.length === 0) return '—';
  const present = completed.filter(l => l.attendanceStatus === 'present').length;
  return `${present}/${completed.length} (${Math.round(present / completed.length * 100)}%)`;
}
```

---

### 仕様3: 月謝管理（H-3）

**新規ファイル**: `src/store/paymentStore.ts`

**月謝ストア**:
```ts
interface PaymentState {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  getPaymentsByMonth: (month: string) => Payment[];
  getPaymentsByStudent: (studentId: string) => Payment[];
  getOverduePayments: () => Payment[];
  bulkCreateMonthlyPayments: (month: string, students: Student[]) => void;
}
```

**月謝一覧UI（生徒管理ページ内タブ）**:
| 生徒名 | 月 | 金額 | ステータス | 支払日 | アクション |
|---|---|---|---|---|---|
| 鈴木 葵 | 2026年5月 | ¥15,000 | 🔴 未払い | — | 支払い記録 |
| 伊藤 涼 | 2026年5月 | ¥27,000 | 🟢 支払済 | 5/20 | — |

**ダッシュボード統計パネルへの月謝情報追加**:
- 今月請求総額: ¥XXX,XXX
- 回収率: XX%（支払済 / 総請求）
- 未回収件数: X件（赤バッジ）

---

### 仕様4: 通知アラートシステム（H-4）

**新規ファイル**: `src/hooks/useAlerts.ts`

```ts
export interface Alert {
  id: string;
  type: 'trial_followup' | 'payment_overdue' | 'makeup_limit' | 'enrollment_stalled';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  studentId?: string;
  createdAt: string;
}

export function useAlerts(): Alert[] {
  const students = useStudentStore(s => s.students);
  const payments = usePaymentStore(s => s.payments);
  const today = new Date();
  
  return useMemo(() => {
    const alerts: Alert[] = [];
    
    // 体験済みで3日以上フォローアップなし
    students
      .filter(s => s.status === 'trial_completed')
      .forEach(s => {
        const trialDate = new Date(s.trialDate ?? s.createdAt);
        const daysSince = differenceInDays(today, trialDate);
        if (daysSince >= 3) {
          alerts.push({
            id: `trial_followup_${s.id}`,
            type: 'trial_followup',
            priority: 'high',
            title: `${s.name}さんのフォローアップ`,
            description: `体験から${daysSince}日経過。入会検討状況を確認してください。`,
            actionLabel: '生徒を確認',
            actionHref: `/students`,
            studentId: s.id,
            createdAt: today.toISOString(),
          });
        }
      });
    
    // 未払い月謝
    payments
      .filter(p => p.status === 'overdue')
      .forEach(p => {
        alerts.push({
          id: `payment_overdue_${p.id}`,
          type: 'payment_overdue',
          priority: 'high',
          title: `月謝未払い`,
          description: `${p.month}の月謝が未払いです。`,
          actionLabel: '支払い管理',
          actionHref: `/students`,
          studentId: p.studentId,
          createdAt: today.toISOString(),
        });
      });
    
    return alerts.sort((a, b) => 
      a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0
    );
  }, [students, payments, today]);
}
```

**Header.tsx の変更**:
```tsx
// 通知ベルにバッジ数を表示
const alerts = useAlerts();
const unreadCount = alerts.filter(a => a.priority === 'high').length;

<button className="relative ...">
  <Bell className="w-5 h-5" />
  {unreadCount > 0 && (
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>
```

---

### 仕様5: レッスンメモ・進捗記録（H-5）

**影響ファイル**:
- `src/types/index.ts` — `Lesson` 型拡張
- 新規: `src/components/schedule/LessonDetailModal.tsx`

**Lesson 型拡張**:
```ts
export interface Lesson {
  // ... existing fields
  lessonNotes?: string;        // 本日のレッスン内容
  homeworkNotes?: string;      // 宿題
  nextLessonPlan?: string;     // 次回予定
  progressTags?: string[];     // 進捗タグ（楽曲名など）
  attendanceStatus?: AttendanceStatus;
  absenceReason?: string;
}
```

**LessonDetailModal の構成**:
```
┌─────────────────────────────────────────┐
│  2026年5月29日(木) 16:00〜16:45    [×] │
│  生徒: 鈴木 葵  /  講師: 中村 由紀      │
├─────────────────────────────────────────┤
│ 出席   [○出席] [×欠席] [△遅刻]         │
├─────────────────────────────────────────┤
│ 今日のレッスン内容                        │
│ ┌─────────────────────────────────────┐ │
│ │ スケール練習（ハ長調）              │ │
│ │ ブルグミュラー第5番 通し練習        │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 宿題                                     │
│ ┌─────────────────────────────────────┐ │
│ │ ブルグミュラー第5番を毎日3回練習    │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 次回予定                                  │
│ ┌─────────────────────────────────────┐ │
│ │ 第5番の仕上げ＋第6番導入            │ │
│ └─────────────────────────────────────┘ │
│              [保存する]   [キャンセル]    │
└─────────────────────────────────────────┘
```

---

### 仕様6: 振替レッスン管理（M-1）

**新規ファイル**: `src/store/makeupStore.ts`

**ワークフロー**:
```
キャンセルレッスン発生
       ↓
「振替を申請する」ボタンをクリック
       ↓
MakeupRequest 作成（status: 'pending'）
       ↓
スケジュールページの「振替管理」タブで確認
       ↓
空きレッスン枠を選択して振替設定
       ↓
MakeupRequest.status → 'scheduled'
MakeupRequest.makeupLessonId → 新規レッスンID
       ↓
レッスン完了後 → status → 'completed'
```

**当月振替回数チェック**:
```ts
function getMonthlyMakeupCount(studentId: string, month: string): number {
  return makeupRequests.filter(
    m => m.studentId === studentId &&
         m.status !== 'expired' &&
         m.requestedAt.startsWith(month)
  ).length;
}
```

---

### 仕様7: グローバル検索（M-3）

**実装ファイル**: `src/components/layout/Header.tsx`

**コマンドパレット形式の検索UI**:
```
[ Cmd+K で検索... ]
       ↓ 入力後
┌──────────────────────────────────┐
│ 🔍 "山田"                        │
├──────────────────────────────────┤
│ 生徒                              │
│  📋 山田 花子  体験待ち           │
│     ヤマダ ハナコ · 090-1111-2222 │
├──────────────────────────────────┤
│ 保護者                            │
│  👥 山田 太郎 (山田 花子の保護者) │
└──────────────────────────────────┘
```

---

### 仕様8: CSVエクスポート（M-4）

**エクスポート形式**: UTF-8 BOM付きCSV（Excel直接対応）

**生徒一覧CSV の列定義**:
```
ID, 氏名, フリガナ, メール, 電話番号, 生年月日, 
保護者氏名, 保護者電話番号, 住所, ステータス, 
担当講師, コース頻度/月, 月謝, 入会日, 体験日, 備考
```

**月次レッスンCSV の列定義**:
```
レッスンID, 日付, 開始時間, 終了時間, 生徒名, 講師名, 
ステータス, 出席状況, 欠席理由, レッスンメモ, 宿題
```

---

### 仕様9: 印刷対応（M-5）

**globals.css 追加内容**:
```css
@media print {
  /* レイアウト要素を非表示 */
  aside,
  header,
  .print\:hidden,
  [data-print-hide] {
    display: none !important;
  }

  /* A4最適化 */
  @page {
    size: A4 portrait;
    margin: 15mm 12mm;
  }

  html, body {
    font-size: 10pt;
    color: #000 !important;
    background: #fff !important;
  }

  /* カードのボーダーを実線に */
  .rounded-xl,
  .rounded-lg {
    border-radius: 0 !important;
    border: 1px solid #aaa !important;
    box-shadow: none !important;
  }

  /* 見出しの余白調整 */
  .px-6.py-4.border-b {
    padding: 8pt 10pt !important;
    background: #f5f5f5 !important;
  }

  /* チェックボックスを印刷可能に */
  input[type="checkbox"] {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ページ内でカードを分断しない */
  .space-y-6 > * {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

---

### 仕様10: 生徒詳細ページ（M-6）

**新規ファイル**: `src/app/students/[id]/page.tsx`

**ページ構成**:
```
/students/[id]
├── 生徒ヘッダー (名前・ステータス・担当講師)
├── タブナビゲーション
│   ├── [基本情報]    ← 現在のDetailModalの内容 + インライン編集
│   ├── [レッスン履歴] ← 全レッスンのタイムライン
│   ├── [支払い]      ← 月謝一覧
│   └── [連絡ログ]    ← 保護者との連絡履歴
└── アクションボタン群
    ├── ステータス変更
    ├── 入会フォームへ (trial_completed のみ)
    └── 削除
```

**レッスン履歴タイムライン**:
```
2026年5月29日（木）16:00〜16:45  ○出席
  講師: 中村 由紀
  内容: スケール練習、ブルグミュラー第5番
  宿題: 毎日3回練習

2026年5月27日（火）16:00〜16:45  ○出席
  講師: 中村 由紀
  内容: ハノン1-5番

2026年5月20日（火）16:00〜16:45  ×欠席（体調不良）
  講師: 中村 由紀
  保護者連絡: 済
```

---

## 実装ロードマップ

### フェーズ1 — コア機能（2〜3週間）
1. **H-1**: データ永続化 (Zustand persist) ← **最優先**
2. **H-2**: 出席管理（型拡張 + LessonCard UI）
3. **H-3**: 月謝管理（paymentStore + 基本UI）
4. **H-4**: アラートシステム（useAlerts + Header UI）
5. **M-5**: 印刷対応CSS（globals.css への追記のみ）

### フェーズ2 — 業務効率化（2〜3週間）
6. **H-5**: レッスンメモ・進捗記録（LessonDetailModal）
7. **M-1**: 振替レッスン管理（makeupStore + UI）
8. **M-3**: グローバル検索（Header + useGlobalSearch）
9. **M-4**: CSVエクスポート（exportCsv.ts + UI）
10. **L-2**: 設定ページ（/settings）

### フェーズ3 — 拡張機能（3〜4週間）
11. **M-2**: 保護者連絡ログ
12. **M-6**: 生徒詳細ページ（/students/[id]）
13. **L-1**: モバイル最適化
14. **L-4**: ダッシュボードパネル追加
15. **L-3**: 講師詳細情報拡張

### フェーズ4 — インフラ（別途見積もり）
16. Supabase 移行（認証 + DB + Row Level Security）
17. メール/LINE通知連携
18. PWA対応（モバイルアプリライク）

---

## まとめ

現システムは**モダンな技術スタック**と**洗練されたUI/UX**を持つ優秀なプロトタイプです。カンバンビュー・ドラッグ&ドロップ・週次スケジュールなど、競合製品でも差別化できる機能が実装されています。

一方、スクール運営を実用に耐えるレベルにするためには:

1. **データ永続化**（現状リロードで全消去）
2. **出席管理**（レッスン単位での○/×）
3. **月謝管理**（支払いステータスの追跡）
4. **アラート通知**（業務上の見落とし防止）

の4点が最急務です。これらは比較的小さな変更で実装でき、スクール運営の実用性を劇的に改善します。

特に「データ永続化」はZustand の `persist` middleware を追加するだけで実現でき、工数は最小ながらシステムの実用価値を最大化します。フェーズ1の実装を優先的に進めることを強く推奨します。
