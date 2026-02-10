# MVP Feature Specification
## Pregnancy-Safe Scanner v1.0

---

## Core Value Proposition
**One sentence:** Scan any food product and instantly know if it's safe for your stage of pregnancy.

---

## MVP Features (v1.0 — Launch)

### 1. Barcode Scanner
- Scan product barcode with phone camera
- Lookup in food database (Open Food Facts API + custom additions)
- Fallback: Manual product search

### 2. Ingredient Analysis Engine
- Parse ingredient list from database
- Cross-reference against pregnancy safety database
- Categorize each ingredient:
  - ✅ **Safe** — No known concerns
  - ⚠️ **Caution** — Limit intake / context-dependent
  - 🚫 **Avoid** — Known risk during pregnancy
  - ❓ **Unknown** — Insufficient data

### 3. Trimester-Specific Filtering
- User sets current trimester (or due date for auto-calculation)
- Safety ratings adjust based on trimester
- Example: Certain herbs risky in 1st trimester but fine in 3rd

### 4. "Why Is This Here?" Explanations
- Every flagged ingredient includes:
  - What it is (plain English)
  - Why it's in the product (function)
  - Why it's flagged for pregnancy (the concern)
  - Source citation
- NO fear-mongering. Context and education.

### 5. Product Safety Summary
- Overall product rating: Safe / Caution / Avoid
- List of flagged ingredients with quick explanations
- "The Bottom Line" — one sentence summary

### 6. Scan History
- Save scanned products
- Quick re-check without rescanning
- Track what you've been eating

### 7. User Onboarding
- Due date / trimester input
- Dietary restrictions (vegetarian, allergies, etc.)
- Optional: First pregnancy vs. experienced mom (affects tone)

---

## NOT in MVP (Future Versions)

| Feature | Why Deferred |
|---------|--------------|
| Breastfeeding mode | v1.5 — after pregnancy validation |
| Baby food scanning | v2.0 — different audience |
| Accumulation tracking | v2.0 — requires habit data |
| Meal planning | Scope creep — stay focused |
| Community features | Scope creep |
| AI chat for questions | Nice-to-have, not core |

---

## User Flow (Happy Path)

```
1. Open app
2. Point camera at barcode
3. [1-2 sec] Product identified
4. See safety summary:
   - "Generally Safe" / "Use Caution" / "Avoid"
   - 2-3 flagged ingredients (if any)
5. Tap ingredient for full explanation
6. Save to history (optional)
```

**Time from open to answer: < 10 seconds**

---

## Design Principles

1. **Speed over completeness** — Fast answer first, details on tap
2. **Calm over alarm** — Green/yellow/red, not skull-and-crossbones
3. **Education over judgment** — "Here's why" not "this is bad"
4. **Trust over flash** — Medical-grade feel, not trendy wellness app
5. **Offline-capable** — Core safety database cached locally

---

## Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Time to first scan | < 30 seconds from install |
| Scan success rate | > 90% (product found) |
| Daily active users | Track for retention |
| Scans per user per week | > 5 |
| App Store rating | > 4.5 stars |

---

## Edge Cases to Handle

1. **Product not in database** — Allow manual ingredient entry or photo of label
2. **Ingredient not in safety database** — Show "Unknown" with explanation
3. **Conflicting safety information** — Show most conservative + explain discrepancy
4. **User not pregnant yet (TTC)** — Offer "trying to conceive" mode
5. **Miscarriage sensitivity** — Careful language, easy way to pause/delete account

---

## Technical Requirements

- Camera access (barcode scanning)
- Internet for product lookup (with offline fallback)
- Local storage for history + cached database
- Push notifications (optional — for updates, not spam)
