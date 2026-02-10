# Technical Architecture
## Pregnancy-Safe Scanner

---

## Recommended Stack

### Option A: Web App (PWA) — RECOMMENDED FOR MVP
| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Next.js 14 + React | Fast, SEO-friendly, PWA-capable |
| Styling | Tailwind CSS | Rapid UI development |
| Barcode Scanning | QuaggaJS or html5-qrcode | Works in browser, no native needed |
| Backend | Next.js API Routes | Serverless, scales automatically |
| Database | Supabase (Postgres) | Free tier generous, real-time capable |
| Auth | Supabase Auth | Built-in, handles email/social |
| Hosting | Vercel | Free tier, auto-deploys from Git |
| AI/Analysis | Claude API or GPT-4 | Ingredient explanation generation |

**Why PWA first:**
- No App Store approval delay
- Works on iOS + Android immediately
- Can "Add to Home Screen" for app-like experience
- Faster to iterate
- Convert to native later if needed

### Option B: Native Mobile (Phase 2)
| Platform | Technology |
|----------|------------|
| Cross-platform | React Native or Expo |
| iOS only | Swift + SwiftUI |
| Android only | Kotlin |

**When to go native:**
- After validating product-market fit
- When PWA limitations hurt (background scanning, widgets)
- When App Store presence becomes critical for trust

---

## Core APIs & Data Sources

### 1. Product Database
| Source | What It Provides | Cost |
|--------|------------------|------|
| **Open Food Facts** | 2M+ products, ingredients, barcodes | Free (open source) |
| **USDA FoodData Central** | Nutrition data, ingredient details | Free |
| **Custom Database** | Pregnancy-specific safety ratings | We build this |

### 2. Barcode Scanning
| Option | Pros | Cons |
|--------|------|------|
| **html5-qrcode** | Free, lightweight, browser-based | Slower than native |
| **QuaggaJS** | Good accuracy, open source | Larger bundle |
| **Dynamsoft** | Enterprise-grade | $$ |

**Recommendation:** Start with html5-qrcode (free), upgrade if needed.

### 3. AI for Explanations
| Use Case | Model | Est. Cost |
|----------|-------|-----------|
| Ingredient explanations | Claude Haiku or GPT-4o-mini | ~$0.001 per explanation |
| Complex analysis | Claude Sonnet | ~$0.01 per analysis |

**Strategy:** Pre-generate explanations for top 500 ingredients. Use AI only for unknowns.

---

## Database Schema (Simplified)

```sql
-- Users
users (
  id, email, due_date, trimester, created_at, preferences_json
)

-- Products (cached from Open Food Facts + custom)
products (
  id, barcode, name, brand, ingredients_text, image_url, 
  last_updated, source
)

-- Ingredients (our safety database)
ingredients (
  id, name, aliases[], category,
  safety_rating_t1, safety_rating_t2, safety_rating_t3,
  safety_rating_breastfeeding,
  explanation, function_in_food, concern_reason,
  sources[], last_reviewed
)

-- Scan History
scans (
  id, user_id, product_id, scanned_at, result_summary
)
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    USER'S PHONE                      │
│  ┌─────────────────────────────────────────────┐    │
│  │              PWA / Mobile App                │    │
│  │  - Camera (barcode scan)                     │    │
│  │  - Local ingredient cache                    │    │
│  │  - Offline fallback                          │    │
│  └──────────────────┬──────────────────────────┘    │
└─────────────────────┼───────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────┐
│                 VERCEL (Backend)                     │
│  ┌─────────────────────────────────────────────┐    │
│  │           Next.js API Routes                 │    │
│  │  - /api/scan (barcode lookup)               │    │
│  │  - /api/product (get product details)       │    │
│  │  - /api/ingredient (get safety info)        │    │
│  └──────────────────┬──────────────────────────┘    │
└─────────────────────┼───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase   │ │  Open Food   │ │  Claude/GPT  │
│  (our data)  │ │    Facts     │ │   (AI gen)   │
│              │ │   (products) │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Security & Privacy

| Concern | Solution |
|---------|----------|
| Health data sensitivity | No PHI stored. Due date is only "sensitive" data. |
| HIPAA | Not applicable — we're not healthcare providers |
| Data encryption | Supabase handles encryption at rest |
| Auth | Email/password + social login via Supabase |
| Privacy policy | Required for App Store — I'll draft |

---

## Development Environment

**What President needs installed:**
1. Node.js (v18+)
2. Git
3. VS Code (recommended)
4. Vercel CLI (for deploys)

**Commands I'll provide:**
```bash
# Clone repo
git clone [repo-url]

# Install dependencies
npm install

# Run locally
npm run dev

# Deploy
vercel --prod
```

---

## Scalability Notes

| Stage | Users | Infrastructure |
|-------|-------|----------------|
| MVP | 0-1,000 | Vercel free tier + Supabase free tier |
| Growth | 1,000-10,000 | Vercel Pro ($20/mo) + Supabase Pro ($25/mo) |
| Scale | 10,000+ | Evaluate dedicated hosting, CDN |

**Cost stays near-zero until we have real traction.**
