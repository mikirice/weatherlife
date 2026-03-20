# WeatherLife 設計書（旧名: DailyPulse）

## 概要
日本の「生活指数」文化を英語圏に展開する公開Webサイト。天気・花粉・UV・服装・傘・洗濯乾燥などの生活判断を1画面にまとめた朝のライフスタイルダッシュボード。

## コンセプト
**「今日1日をどう過ごすか」を1画面で判断できるサイト**
- tenki.jpの生活指数 × 英語圏向けローカライズ
- 誰でもアクセス可能（ログイン不要）
- 毎朝開くブックマークサイトを目指す
- サービス名: **WeatherLife**（天気 × 生活）

---

## アーキテクチャ

### 技術スタック
| レイヤー | 技術 | 理由 |
|---------|------|------|
| フロントエンド | Next.js 15 (App Router) | SSR/ISR対応、SEO最適 |
| ホスティング | Vercel | Edge Functions、ISRキャッシュ |
| DB | Supabase (PostgreSQL) | ユーザー設定保存、将来のPro機能 |
| 認証 | Supabase Auth | Pro機能用（基本機能は認証不要） |
| 広告 | Google AdSense | Web向け広告表示 |
| スタイリング | Tailwind CSS v4 | 高速開発、レスポンシブ |
| 言語 | TypeScript | 型安全 |

### API選定
| API | 用途 | 無料枠 | 認証 |
|-----|------|--------|------|
| Open-Meteo Weather | 天気・気温・湿度・風速・UV・降水確率・日射量 | 10,000 calls/日（非商用）| キー不要 |
| Open-Meteo Air Quality | PM2.5・AQI・大気汚染物質 | 同上 | キー不要 |
| Google Pollen API | 花粉（65カ国対応）| 5,000 calls/月 | APIキー必須 |
| RainViewer | 降水レーダー（タイルオーバーレイ） | 1,000 req/日 | キー不要 |
| OpenWeatherMap Maps | 天気マップタイル（気温/風/雲/気圧/降水） | 1,000 calls/日 | APIキー（無料） |
| NOAA NHC | ハリケーン/台風トラック・予報 | 無制限 | 不要 |
| NWS Alerts API | 気象警報（米国） | 無制限 | User-Agentのみ |
| GDACS | グローバル災害アラート | 無制限 | 不要 |

### 地図ライブラリ
- **Leaflet + OpenStreetMap**（完全無料、42KB gzip、RainViewer/OWM公式対応）

**重要**: Open-Meteoは商用利用時に有料プラン必要（€29/月〜）。MVP段階はトラフィック少ないため無料枠で開始し、収益化後に有料プランへ移行。追加APIは全て無料。

### キャッシュ戦略（API節約の生命線）

```
ユーザーリクエスト
  → Vercel Edge Cache (CDN)  ← 1時間TTL
    → miss → API Route (サーバー)
      → Supabase Cache Table  ← 地域×時間帯でキャッシュ
        → miss → 外部API呼び出し
          → 結果をキャッシュに保存 → レスポンス
```

| キャッシュ層 | TTL | 目的 |
|------------|-----|------|
| Vercel Edge (CDN) | 60分 | 同一URL同一レスポンス |
| Supabase cache テーブル | 3時間 | 同一地域の重複API呼び出し防止 |
| クライアント (SWR) | 30分 | 再訪問時のAPI節約 |

**地域の丸め**: 緯度経度を小数点1桁（約11km四方）に丸めてキャッシュキーにする。同じ地域の異なるユーザーが同じキャッシュを共有。

**API呼び出し見積もり**:
- 1地域あたり1日8回（3時間TTL）
- 100地域 × 8回 = 800 calls/日（Open-Meteo無料枠内）
- Google Pollen: 100地域 × 8回 = 800 calls/月（5,000枠内）

---

## 画面構成

### ページ一覧
| パス | 内容 | SSR/ISR |
|------|------|---------|
| `/` | ランディング + 位置情報取得 → ダッシュボードへリダイレクト | SSR |
| `/[city]` | 都市別ダッシュボード（メインページ）| ISR (60min) |
| `/[city]/radar` | レーダー＆天気マップ（都市中心） | CSR |
| `/radar` | グローバルレーダーマップ（全画面） | CSR |
| `/storms` | ハリケーン/台風トラッカー | CSR (リアルタイム) |
| `/alerts` | 気象警報一覧 | SSR |
| `/air-quality` | 大気質マップ＆都市別AQI | ISR (60min) |
| `/about` | サービス紹介・使い方 | Static |
| `/cities` | 主要都市一覧（SEO用） | ISR (24h) |

### メインダッシュボード (`/[city]`)

```
┌─────────────────────────────────────────┐
│  DailyPulse          [Tokyo] [🔍]  [☰] │
├─────────────────────────────────────────┤
│                                         │
│  Thursday, March 19, 2026               │
│  Tokyo, Japan                           │
│                                         │
│  ┌─────────┐  ┌─────────┐              │
│  │  18°C   │  │ Feels   │              │
│  │  ⛅     │  │  15°C   │              │
│  └─────────┘  └─────────┘              │
│                                         │
│  ═══════════════════════════════════════ │
│  TODAY'S LIFE INDICES                   │
│  ═══════════════════════════════════════ │
│                                         │
│  👕 Clothing     Light jacket           │
│  ████████░░ 7/10                        │
│                                         │
│  ☂️ Umbrella     Not needed             │
│  ██░░░░░░░░ 2/10                        │
│                                         │
│  👃 Pollen       High - mask up!        │
│  ████████░░ 8/10                        │
│                                         │
│  🧺 Laundry     Great drying day       │
│  ████████░░ 8/10                        │
│                                         │
│  ☀️ UV Index     Moderate               │
│  █████░░░░░ 5/10                        │
│                                         │
│  ═══════════════════════════════════════ │
│           [ Ad Banner ]                 │
│  ═══════════════════════════════════════ │
│                                         │
│  😷 Cold Risk    Low                    │
│  ██░░░░░░░░ 2/10                        │
│                                         │
│  🏃 Exercise     Perfect for running    │
│  █████████░ 9/10                        │
│                                         │
│  💧 Humidity     Comfortable            │
│  █████░░░░░ 5/10                        │
│                                         │
│  🌟 Stargazing   Clear skies tonight    │
│  ████████░░ 8/10                        │
│                                         │
│  ─────────────────────────────────────  │
│  HOURLY BREAKDOWN                       │
│  6AM  9AM  12PM  3PM  6PM  9PM         │
│  12°  15°   18°  17°  14°  11°         │
│  ☀️    ⛅    ⛅   ☁️   ☁️   🌙          │
│  ─────────────────────────────────────  │
│                                         │
│           [ Ad Banner ]                 │
│                                         │
│  ─────────────────────────────────────  │
│  🔓 Unlock all 16 indices → Go Pro     │
│  ─────────────────────────────────────  │
│                                         │
│  © 2026 DailyPulse                      │
└─────────────────────────────────────────┘
```

### 無料 vs Pro 指数・機能

| | Free | Pro $4.99/月 ($39.99/年) |
|---|------|--------------------------|
| **基本指数8つ** | ✅ | ✅ |
| **Pro指数+8つ（季節自動切替）** | | ✅ |
| **広告** | あり | なし |
| **予測期間** | 今日のみ | 10日先まで |
| **時間別指数変化** | | ✅（「午後から傘必要」等） |
| **都市保存** | 1つ | 5つまで |
| **雨雲接近通知** | | ✅ |
| **朝のサマリー通知** | | ✅ |
| **パーソナライズ** | | ✅（花粉症、ランナー等のプロファイル） |

#### 生活指数一覧

**通年（Free: 8指数）**
| # | 指数 | Free | Pro |
|---|------|------|-----|
| 1 | Clothing (服装) | ✅ | ✅ |
| 2 | Umbrella (傘) | ✅ | ✅ |
| 3 | Pollen (花粉) | ✅ | ✅ |
| 4 | Laundry (洗濯乾燥) | ✅ | ✅ |
| 5 | UV Index (紫外線) | ✅ | ✅ |
| 6 | Cold Risk (風邪ひき) | ✅ | ✅ |
| 7 | Exercise (運動) | ✅ | ✅ |
| 8 | Humidity/Comfort (快適度) | ✅ | ✅ |

**通年（Pro限定）**
| # | 指数 | Free | Pro |
|---|------|------|-----|
| 9 | Stargazing (星空) | | ✅ |
| 10 | Car Wash (洗車) | | ✅ |
| 11 | Skin Dryness (肌乾燥) | | ✅ |
| 12 | Pipe Freezing (水道凍結) | | ✅ |

**季節限定（Pro限定・自動切替）**
| # | 指数 | 季節 |
|---|------|------|
| 13 | Heating/Cooling (冷暖房) | 通年 |
| 14 | Nabe/Hot Pot (鍋もの) | 秋冬 (10-3月) |
| 15 | Beer (ビール日和) | 春夏 (4-9月) |
| 16 | Ice Cream (アイス日和) | 春夏 (4-9月) |

無料で8指数（十分実用的）。Proで+8指数 + 10日予測 + 時間別変化 + 通知。

---

## データモデル

### Supabase テーブル

```sql
-- APIキャッシュ
CREATE TABLE weather_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lat_rounded DECIMAL(4,1) NOT NULL,  -- 小数点1桁に丸め
  lon_rounded DECIMAL(5,1) NOT NULL,
  data JSONB NOT NULL,                -- API生レスポンス
  indices JSONB NOT NULL,             -- 計算済み生活指数
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(lat_rounded, lon_rounded)
);

CREATE INDEX idx_cache_location ON weather_cache(lat_rounded, lon_rounded);
CREATE INDEX idx_cache_expires ON weather_cache(expires_at);

-- 主要都市マスタ（SEO用の静的ページ生成）
CREATE TABLE cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,   -- "tokyo", "new-york"
  name VARCHAR(200) NOT NULL,          -- "Tokyo, Japan"
  lat DECIMAL(6,3) NOT NULL,
  lon DECIMAL(7,3) NOT NULL,
  country_code CHAR(2) NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  population INT
);

-- ユーザー（Pro機能用、基本機能では不要）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  saved_locations JSONB DEFAULT '[]',  -- [{lat, lon, name}]
  preferences JSONB DEFAULT '{}',      -- {units: "metric", pollen_alert: true}
  plan VARCHAR(20) DEFAULT 'free',     -- "free" | "pro"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pro課金管理
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(20) NOT NULL,         -- "active" | "canceled" | "past_due"
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 生活指数の計算ロジック

全てOpen-Meteoの生データから計算。各指数は0-10スケール + テキストラベル。

### 使用するAPI変数
```
temperature_2m, apparent_temperature, relative_humidity_2m,
wind_speed_10m, precipitation_probability, precipitation_sum,
weather_code, uv_index, cloud_cover, visibility,
sunshine_duration, shortwave_radiation
```

### 計算式（主要指数）

#### 1. Clothing (服装指数)
```typescript
function clothingIndex(apparentTemp: number): { score: number; label: string } {
  if (apparentTemp >= 30) return { score: 10, label: "Tank top & shorts" };
  if (apparentTemp >= 25) return { score: 8, label: "T-shirt & light pants" };
  if (apparentTemp >= 20) return { score: 7, label: "Long sleeve shirt" };
  if (apparentTemp >= 15) return { score: 5, label: "Light jacket" };
  if (apparentTemp >= 10) return { score: 4, label: "Sweater & jacket" };
  if (apparentTemp >= 5)  return { score: 3, label: "Coat & scarf" };
  if (apparentTemp >= 0)  return { score: 2, label: "Heavy coat & gloves" };
  return { score: 1, label: "Full winter gear" };
}
```

#### 2. Umbrella (傘指数)
```typescript
function umbrellaIndex(precipProb: number, weatherCode: number): { score: number; label: string } {
  const isRainCode = [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(weatherCode);
  if (isRainCode || precipProb >= 70) return { score: 10, label: "Bring umbrella!" };
  if (precipProb >= 50) return { score: 7, label: "Umbrella recommended" };
  if (precipProb >= 30) return { score: 4, label: "Foldable umbrella just in case" };
  return { score: 1, label: "No umbrella needed" };
}
```

#### 3. Laundry (洗濯乾燥指数)
```typescript
function laundryIndex(temp: number, humidity: number, windSpeed: number, precipProb: number, sunshine: number): { score: number; label: string } {
  if (precipProb >= 50) return { score: 1, label: "Indoor drying only" };

  let score = 0;
  // 気温 (0-3)
  score += temp >= 25 ? 3 : temp >= 20 ? 2.5 : temp >= 15 ? 1.5 : 0.5;
  // 湿度 (0-3) 低いほど良い
  score += humidity < 40 ? 3 : humidity < 60 ? 2 : humidity < 80 ? 1 : 0;
  // 風速 (0-2)
  score += windSpeed >= 5 ? 2 : windSpeed >= 3 ? 1.5 : windSpeed >= 1 ? 1 : 0.5;
  // 日照 (0-2)
  score += sunshine >= 6 ? 2 : sunshine >= 3 ? 1 : 0;

  score = Math.round(score);
  const labels = ["", "Indoor drying only", "Barely dries", "Slow drying", "Will dry", "Dries OK",
                  "Good drying day", "Great drying day", "Very quick drying", "Excellent!", "Perfect laundry day!"];
  return { score, label: labels[score] || "Perfect laundry day!" };
}
```

#### 4. Pollen (花粉指数)
```typescript
// Google Pollen APIのUPI (0-5) を 0-10 スケールに変換
function pollenIndex(upi: number, inSeason: boolean): { score: number; label: string } {
  if (!inSeason) return { score: 0, label: "No pollen season" };
  const score = Math.round(upi * 2); // 0-5 → 0-10
  const labels = ["None", "None", "Very Low", "Low", "Moderate", "Moderate",
                  "High", "High", "Very High", "Very High", "Extreme"];
  return { score, label: labels[score] };
}
```

#### 5. UV Index (紫外線指数)
```typescript
// Open-Meteo UV indexをそのまま使用 (0-11+)、10段階に正規化
function uvIndexScore(uvIndex: number): { score: number; label: string } {
  const score = Math.min(10, Math.round(uvIndex));
  if (uvIndex >= 11) return { score: 10, label: "Extreme - avoid sun" };
  if (uvIndex >= 8) return { score: 8, label: "Very High - sunscreen essential" };
  if (uvIndex >= 6) return { score: 6, label: "High - hat & sunscreen" };
  if (uvIndex >= 3) return { score: Math.round(uvIndex), label: "Moderate" };
  return { score: Math.round(uvIndex), label: "Low" };
}
```

#### 6. Cold Risk (風邪ひき指数)
```typescript
function coldRiskIndex(temp: number, humidity: number, tempDiff: number): { score: number; label: string } {
  // tempDiff = 日中の最高気温 - 最低気温（寒暖差）
  let score = 0;
  // 低温リスク
  score += temp < 5 ? 3 : temp < 10 ? 2 : temp < 15 ? 1 : 0;
  // 乾燥リスク
  score += humidity < 30 ? 3 : humidity < 40 ? 2 : humidity < 50 ? 1 : 0;
  // 寒暖差リスク
  score += tempDiff > 15 ? 4 : tempDiff > 10 ? 3 : tempDiff > 7 ? 2 : tempDiff > 5 ? 1 : 0;

  score = Math.min(10, score);
  if (score >= 8) return { score, label: "High risk - stay warm!" };
  if (score >= 5) return { score, label: "Moderate risk - dress warmly" };
  if (score >= 3) return { score, label: "Low risk" };
  return { score, label: "Very low risk" };
}
```

#### 7. Exercise (運動指数)
```typescript
function exerciseIndex(apparentTemp: number, precipProb: number, windSpeed: number, uvIndex: number): { score: number; label: string } {
  if (precipProb >= 60) return { score: 1, label: "Indoor workout day" };
  let score = 10;
  // 体感温度ペナルティ
  if (apparentTemp > 35 || apparentTemp < -5) score -= 5;
  else if (apparentTemp > 30 || apparentTemp < 0) score -= 3;
  else if (apparentTemp > 28 || apparentTemp < 5) score -= 1;
  // 強風ペナルティ
  if (windSpeed > 10) score -= 2;
  else if (windSpeed > 7) score -= 1;
  // UV高すぎペナルティ
  if (uvIndex > 8) score -= 2;
  // 降水ペナルティ
  if (precipProb >= 40) score -= 2;

  score = Math.max(1, Math.min(10, score));
  if (score >= 8) return { score, label: "Perfect for outdoor exercise!" };
  if (score >= 5) return { score, label: "Good with precautions" };
  return { score, label: "Consider indoor exercise" };
}
```

---

## ファイル構成

```
dailypulse/
├── public/
│   ├── icons/              # 各指数のアイコン (SVG)
│   ├── og-image.png        # OGP画像
│   └── manifest.json       # PWA manifest
├── src/
│   ├── app/
│   │   ├── layout.tsx      # ルートレイアウト（ヘッダー、フッター、AdSense）
│   │   ├── page.tsx        # "/" - 位置情報取得 → リダイレクト
│   │   ├── [city]/
│   │   │   └── page.tsx    # "/tokyo" - メインダッシュボード (ISR)
│   │   ├── cities/
│   │   │   └── page.tsx    # "/cities" - 都市一覧 (SEO)
│   │   ├── about/
│   │   │   └── page.tsx    # "/about" - サービス紹介
│   │   ├── login/
│   │   │   └── page.tsx    # "/login" - ログイン
│   │   ├── settings/
│   │   │   └── page.tsx    # "/settings" - パーソナライズ (CSR)
│   │   └── api/
│   │       ├── weather/
│   │       │   └── route.ts  # GET /api/weather?lat=X&lon=X
│   │       └── pollen/
│   │           └── route.ts  # GET /api/pollen?lat=X&lon=X
│   ├── components/
│   │   ├── IndexCard.tsx       # 指数カード（スコアバー + ラベル）
│   │   ├── Dashboard.tsx       # 指数一覧
│   │   ├── HourlyForecast.tsx  # 時間別予報
│   │   ├── CitySearch.tsx      # 都市検索
│   │   ├── AdBanner.tsx        # 広告バナー
│   │   ├── ProBadge.tsx        # Pro限定バッジ
│   │   └── Header.tsx          # ヘッダー
│   ├── lib/
│   │   ├── indices/
│   │   │   ├── clothing.ts     # 服装指数
│   │   │   ├── umbrella.ts     # 傘指数
│   │   │   ├── laundry.ts      # 洗濯指数
│   │   │   ├── pollen.ts       # 花粉指数
│   │   │   ├── uv.ts           # UV指数
│   │   │   ├── cold-risk.ts    # 風邪ひき指数
│   │   │   ├── exercise.ts     # 運動指数
│   │   │   ├── comfort.ts      # 快適度指数
│   │   │   └── index.ts        # 全指数のexport
│   │   ├── api/
│   │   │   ├── open-meteo.ts   # Open-Meteo APIクライアント
│   │   │   ├── pollen.ts       # Google Pollen APIクライアント
│   │   │   └── cache.ts        # キャッシュ管理
│   │   ├── cities.ts           # 主要都市データ
│   │   ├── geo.ts              # 位置情報ユーティリティ（座標丸め等）
│   │   └── supabase.ts         # Supabaseクライアント
│   ├── types/
│   │   ├── weather.ts          # API型定義
│   │   └── index.ts            # 生活指数型定義
│   └── styles/
│       └── globals.css
├── supabase/
│   └── migrations/
│       └── 001_initial.sql     # テーブル定義
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local                  # GOOGLE_POLLEN_API_KEY, SUPABASE_URL, etc.
```

---

## SEO戦略

### 主要都市の静的ページ
初期登録50都市（ISR 60分）で生成:
- `/tokyo`, `/new-york`, `/london`, `/paris`, `/sydney` ...
- 各ページに `<title>Today's Life Index for Tokyo | DailyPulse</title>`
- 構造化データ (JSON-LD) で天気情報をマークアップ

### ターゲットキーワード
- "what to wear today [city]"
- "should I bring umbrella today"
- "pollen level today [city]"
- "is it a good day to do laundry"
- "today's UV index [city]"

### OGP動的生成
`/[city]` ページごとにOGP画像を動的生成（Vercel OG）:
「Tokyo Today: 🌤 18°C | 👕 Light jacket | ☂️ Not needed | 🧺 Great drying day」

---

## 収益モデル（方針転換: 2026-03-19）

**現フェーズ: 非商用・無料公開（ポートフォリオ＆実績作り）**
- 広告なし、課金なし
- Open-Meteo無料枠（非商用）で運用 → APIコスト$0
- 全16指数を無料公開（ロックなし）
- Product Huntでローンチして反響を見る
- 反響次第で商用化（広告 + $3/月広告非表示Pro）を判断

**商用化する場合の計画（反響があった場合のみ）:**
- Open-Meteo商用プラン: €29/月（$32）
- 広告（AdSense）: メイン収益源
- 広告非表示Pro: $3/月（Stripe Checkout）
- 最低目標: API費用$32/月の回収（月1万〜1.6万PV）

---

## 実装フェーズ

### Phase 1: 基盤 + 基本指数（3日）
- Next.js プロジェクトセットアップ
- Supabase テーブル作成（cache, cities）
- Open-Meteo APIクライアント + 3層キャッシュ
- 基本指数8つの計算ロジック（服装・傘・洗濯・UV・花粉・風邪ひき・運動・快適度）
- Google Pollen API統合
- メインダッシュボードUI（`/[city]`）
- 位置情報取得 + 都市リダイレクト（`/`）
- レスポンシブデザイン

### Phase 2: Pro機能（3日）✅ 完了
- Supabase Auth + Stripe + Pro指数+8 + 10日予測 + 時間別変化 + 都市保存 + パーソナライズ
- ※ 方針転換により、Pro課金・指数ロックは無効化予定。全機能無料公開へ

### Phase 3: SEO + デプロイ（2日）← 旧Phase 4を繰り上げ
- Pro機能のロック解除（全16指数を無料化、Stripe/Auth関連UIを削除）
- 主要50都市のISRページ最適化
- OGP動的画像生成（Vercel OG）
- JSON-LD構造化データ
- sitemap.xml / robots.txt
- `/about` ページ、`/cities` 都市一覧ページ
- Product Hunt用アセット（スクリーンショット、説明文）
- Vercel本番デプロイ（非商用・広告なし）

### 旧Phase 3（広告+通知）→ 棚上げ
- 商用化判断後に実施

---

## Phase 4-6: 天気機能拡張（weather.com/accuweatherを美しいUIで超える）

### 設計方針
- **同じ無料データを、圧倒的に美しいUIで提供する**
- weather.com/accuweatherの機能を内包しつつ、生活指数がメインの差別化軸
- 全API無料、追加コスト$0
- Leaflet + OpenStreetMapで地図表示（完全無料）
- 全ページでダークモード対応の地図UI（天気マップは暗い背景が映える）

---

### Phase 4: レーダー＆天気マップ（2日）

#### 4-1. グローバルレーダーページ (`/radar`)

全画面の降水レーダーマップ。weather.comのレーダーページに相当。

```
┌──────────────────────────────────────────────┐
│ WeatherLife    [🔍 Search]   [Cities] [About]│
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │                                      │    │
│  │         Leaflet Map (dark theme)     │    │
│  │         + RainViewer tile overlay    │    │
│  │                                      │    │
│  │   [▶ Play] ──●────────── [Now]       │    │
│  │   (レーダーアニメーション再生バー)     │    │
│  │                                      │    │
│  │   Layer: [Rain] [Temp] [Wind]        │    │
│  │          [Clouds] [Pressure]         │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

**実装詳細:**
- `src/app/radar/page.tsx` - "use client"（地図操作はクライアントサイド）
- `src/components/maps/WeatherMap.tsx` - Leaflet地図コンポーネント（再利用可能）
- `src/components/maps/RadarOverlay.tsx` - RainViewerタイルオーバーレイ
- `src/components/maps/LayerSwitcher.tsx` - レイヤー切替UI（Rain/Temp/Wind/Clouds/Pressure）
- `src/components/maps/TimelineSlider.tsx` - レーダーアニメーション再生バー
- `src/lib/api/rainviewer.ts` - RainViewer APIクライアント（タイルURL取得）
- `src/lib/api/owm-tiles.ts` - OpenWeatherMap タイルURL生成

**RainViewer統合:**
```typescript
// RainViewer APIからタイムスタンプ一覧を取得
// GET https://api.rainviewer.com/public/weather-maps.json
// → timestamps[] を取得し、タイルURLを生成:
// https://tilecache.rainviewer.com/v2/radar/{timestamp}/256/{z}/{x}/{y}/2/1_1.png

// アニメーション: timestamps配列を0.5秒間隔で切替
```

**OpenWeatherMapタイル:**
```typescript
// 気温: https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid={key}
// 風速: https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid={key}
// 雲量: https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid={key}
// 気圧: https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid={key}
// 降水: https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid={key}
```

**地図のスタイル:**
- ベースマップ: CartoDB Dark Matter（暗い背景で天気レイヤーが映える）
- URL: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- レーダータイルはカラフルに際立つ

#### 4-2. 都市レーダーページ (`/[city]/radar`)

都市ダッシュボードからリンクする、その都市を中心としたレーダービュー。
WeatherMapコンポーネントを再利用し、初期位置を都市の座標にセット。

#### 4-3. ダッシュボードへのレーダーミニマップ埋め込み

`/[city]` のダッシュボードに小さなレーダープレビューを追加。
クリックで `/[city]/radar` に遷移。

```
┌─────────────────────────────────────┐
│ 📡 Radar                    [→ Map] │
│ ┌─────────────────────────────────┐ │
│ │   ミニマップ (Leaflet)          │ │
│ │   300x200px, 降水レーダー表示   │ │
│ │   操作不可、表示のみ            │ │
│ └─────────────────────────────────┘ │
│ Light rain expected around 2PM      │
└─────────────────────────────────────┘
```

- `src/components/maps/RadarMiniMap.tsx` - 小さな静的レーダープレビュー

**ファイル構成（Phase 4）:**
```
src/
├── app/
│   ├── radar/
│   │   └── page.tsx              # グローバルレーダー（全画面）
│   └── [city]/
│       └── radar/
│           └── page.tsx          # 都市レーダー
├── components/
│   └── maps/
│       ├── WeatherMap.tsx        # Leaflet地図（共通）
│       ├── RadarOverlay.tsx      # RainViewerオーバーレイ
│       ├── WeatherTileLayer.tsx  # OWMタイルレイヤー
│       ├── LayerSwitcher.tsx     # レイヤー切替
│       ├── TimelineSlider.tsx    # アニメーション再生バー
│       └── RadarMiniMap.tsx      # ダッシュボード埋め込み用
└── lib/
    └── api/
        ├── rainviewer.ts         # RainViewer API
        └── owm-tiles.ts          # OWMタイルURL生成
```

---

### Phase 5: ハリケーン/台風トラッカー（1日）

#### 5-1. ストームトラッカーページ (`/storms`)

アクティブなハリケーン/台風を地図上に表示。

```
┌──────────────────────────────────────────────┐
│ WeatherLife    [🔍 Search]   [Cities] [About]│
├──────────────────────────────────────────────┤
│                                              │
│  🌀 Active Storms                            │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │                                      │    │
│  │    Leaflet Map (dark theme)          │    │
│  │    + storm icons at current position │    │
│  │    + forecast track lines            │    │
│  │    + uncertainty cone (半透明)        │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ 🌀 Milton   │  │ 🌀 Helene   │           │
│  │ Cat 4       │  │ TS          │           │
│  │ 150 mph     │  │ 65 mph      │           │
│  │ Moving NW   │  │ Moving NE   │           │
│  └─────────────┘  └─────────────┘           │
│                                              │
│  No active storms? →                         │
│  "No active tropical storms right now.       │
│   Check back during hurricane season          │
│   (Jun-Nov Atlantic, May-Nov W. Pacific)"    │
│                                              │
└──────────────────────────────────────────────┘
```

**実装詳細:**

**NOAA NHC データ取得:**
```typescript
// アクティブストーム一覧
// GET https://www.nhc.noaa.gov/CurrentStorms.json
// → storms[]: { id, name, classification, movement, intensity, ... }

// 予報トラック (GeoJSON)
// GET https://www.nhc.noaa.gov/storm_graphics/api/{stormId}_TRACK_latest.json
// → forecastTrack, bestTrack, windExtent

// ArcGIS MapServer (代替/補完)
// GET https://mapservices.weather.noaa.gov/tropical/rest/services/tropical/NHC_Tropical_Analysis/MapServer
```

**地図上の表示:**
- 現在位置: カテゴリに応じた色のアイコン（TD=灰, TS=黄, Cat1-2=橙, Cat3+=赤）
- 予報トラック: 点線 + 時間ラベル（24h, 48h, 72h, 96h, 120h）
- 不確実性コーン: 半透明のポリゴン
- クリックでストーム詳細ポップアップ

**ストームカード:**
- `src/components/storms/StormCard.tsx` - 各ストームの概要カード
- `src/components/storms/StormTrack.tsx` - Leaflet上の予報トラック描画
- `src/components/storms/StormDetail.tsx` - 詳細ポップアップ

**ストームがない期間:**
- 「No active storms」メッセージ + 次のシーズン情報
- 過去のストーム統計や季節予報へのリンク（将来拡張）

**ファイル構成（Phase 5）:**
```
src/
├── app/
│   └── storms/
│       └── page.tsx              # ストームトラッカー
├── components/
│   └── storms/
│       ├── StormCard.tsx         # ストーム概要カード
│       ├── StormTrack.tsx        # 地図上のトラック描画
│       └── StormDetail.tsx       # 詳細ポップアップ
└── lib/
    └── api/
        └── nhc.ts                # NOAA NHCクライアント
```

---

### Phase 6: 気象警報 + 大気質（1日）

#### 6-1. 気象警報ページ (`/alerts`)

位置情報 or 都市選択に基づいて気象警報を表示。

```
┌──────────────────────────────────────────────┐
│ ⚠️ Weather Alerts                             │
│                                              │
│ ┌─ ACTIVE ──────────────────────────────────┐│
│ │ 🔴 Severe Thunderstorm Warning            ││
│ │    Tokyo Metropolitan Area                ││
│ │    Until 6:00 PM JST                      ││
│ │    Heavy rain, damaging winds expected    ││
│ │    [View Details]                         ││
│ ├───────────────────────────────────────────┤│
│ │ 🟡 Heat Advisory                          ││
│ │    Southern Tokyo                         ││
│ │    Until 8:00 PM JST                      ││
│ │    Heat index up to 40°C                  ││
│ │    [View Details]                         ││
│ └───────────────────────────────────────────┘│
│                                              │
│ ┌─ GLOBAL EVENTS ──────────────────────────┐ │
│ │ 🌊 Tsunami Watch - Pacific (GDACS)       │ │
│ │ 🌋 Volcanic Activity - Philippines       │ │
│ └───────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**データソース:**
```typescript
// 米国: NWS API
// GET https://api.weather.gov/alerts?point={lat},{lon}
// Headers: { "User-Agent": "WeatherLife (contact@weatherlife.app)" }

// グローバル災害: GDACS RSS
// GET https://www.gdacs.org/xml/rss.xml
// XMLパースして直近の災害アラートを取得

// 将来: MeteoAlarm（欧州）を追加可能
```

**アラートの重要度カラー:**
- 🔴 Warning（警告）: 赤背景
- 🟠 Watch（注意報）: 橙背景
- 🟡 Advisory（情報）: 黄背景
- 🔵 Statement（声明）: 青背景

**ダッシュボードへの統合:**
`/[city]` のダッシュボードに警報がある場合、ページ最上部にアラートバナーを表示。

```
┌─────────────────────────────────────────────┐
│ ⚠️ Severe Thunderstorm Warning until 6PM   │
│    Heavy rain, damaging winds    [Details →]│
└─────────────────────────────────────────────┘
```

- `src/components/alerts/AlertBanner.tsx` - ダッシュボード上部のバナー

#### 6-2. 大気質ページ (`/air-quality`)

AQIマップと都市別の大気質情報。

```
┌──────────────────────────────────────────────┐
│ 🌬️ Air Quality                               │
│                                              │
│ ┌──────────────────────────────────────┐     │
│ │   Leaflet Map                        │     │
│ │   + AQIヒートマップオーバーレイ      │     │
│ └──────────────────────────────────────┘     │
│                                              │
│  Tokyo  AQI 42 🟢 Good                      │
│  ├─ PM2.5: 12 µg/m³                         │
│  ├─ PM10:  18 µg/m³                         │
│  ├─ O3:    45 µg/m³                         │
│  └─ NO2:   8 µg/m³                          │
│                                              │
│  24h Trend: [━━━━━━━━━━━━━] 32→42→38        │
│                                              │
│  Health Advice:                              │
│  "Air quality is good. Enjoy outdoor         │
│   activities without concern."               │
│                                              │
└──────────────────────────────────────────────┘
```

**Open-Meteo Air Quality API:**
```typescript
// GET https://air-quality-api.open-meteo.com/v1/air-quality
//   ?latitude={lat}&longitude={lon}
//   &hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,
//           sulphur_dioxide,ozone,us_aqi,european_aqi
//   &forecast_days=3
```

**AQIカラースケール（US EPA）:**
| AQI | カラー | ラベル | ヘルスアドバイス |
|-----|--------|--------|----------------|
| 0-50 | 🟢 | Good | 問題なし |
| 51-100 | 🟡 | Moderate | 極端に敏感な人は注意 |
| 101-150 | 🟠 | Unhealthy for Sensitive | 敏感な人は屋外活動を制限 |
| 151-200 | 🔴 | Unhealthy | 全員が屋外活動を制限 |
| 201-300 | 🟣 | Very Unhealthy | 全員が屋外活動を回避 |
| 301+ | 🟤 | Hazardous | 全員が屋外を避ける |

**ダッシュボードへの統合:**
`/[city]` の指数カードエリアにAQIカードを追加（既存のcomfort指数の隣に配置）。

**ファイル構成（Phase 6）:**
```
src/
├── app/
│   ├── alerts/
│   │   └── page.tsx              # 気象警報一覧
│   └── air-quality/
│       └── page.tsx              # 大気質ページ
├── components/
│   ├── alerts/
│   │   ├── AlertBanner.tsx       # ダッシュボード上部バナー
│   │   ├── AlertCard.tsx         # 警報カード
│   │   └── AlertList.tsx         # 警報一覧
│   └── air-quality/
│       ├── AqiCard.tsx           # AQI概要カード
│       ├── AqiDetail.tsx         # 詳細（汚染物質内訳）
│       └── AqiMap.tsx            # AQIヒートマップ
└── lib/
    └── api/
        ├── nws.ts                # NWS Alerts API
        ├── gdacs.ts              # GDACS RSSパーサー
        └── air-quality.ts        # Open-Meteo AQ整形
```

---

### ナビゲーション更新

ヘッダーに新ページへのリンクを追加:

```
WeatherLife  [🔍 Search]  [Radar] [Storms] [Alerts] [Air] [Cities] [About]
```

モバイルではハンバーガーメニューに格納。

---

### 環境変数追加

```
# OpenWeatherMap（天気マップタイル用、無料）
NEXT_PUBLIC_OWM_API_KEY=
```

### 旧Phase 3（広告+通知）→ 棚上げ
- 商用化判断後に実施

---

## 環境変数
```
# Supabase（キャッシュ用、なくても動作する）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Pollen（なくても動作する、"Unavailable"表示）
GOOGLE_POLLEN_API_KEY=

# OpenWeatherMap（天気マップタイル用、無料キー）
NEXT_PUBLIC_OWM_API_KEY=

# Stripe（棚上げ中、なくても動作する）
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_SITE_URL=https://weatherlife.vercel.app
```
