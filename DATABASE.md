# Ingredient Database Strategy
## Pregnancy-Safe Scanner

---

## Overview

The ingredient safety database is our core IP. This document outlines how we build, maintain, and scale it.

---

## Database Structure

### Ingredient Record
```json
{
  "id": "ing_001",
  "name": "Aspartame",
  "aliases": ["E951", "NutraSweet", "Equal"],
  "category": "artificial_sweetener",
  
  "safety": {
    "first_trimester": "caution",
    "second_trimester": "caution", 
    "third_trimester": "caution",
    "breastfeeding": "caution",
    "ttc": "safe"
  },
  
  "explanation": {
    "what_it_is": "An artificial sweetener about 200 times sweeter than sugar.",
    "why_in_food": "Provides sweetness without calories. Cheaper than sugar in many applications.",
    "pregnancy_concern": "Some studies suggest potential links to preterm delivery at high consumption. FDA considers it safe in moderate amounts, but many OBs recommend limiting.",
    "bottom_line": "Occasional consumption is likely fine. Consider limiting daily diet soda habit.",
    "sources": ["FDA", "American Pregnancy Association", "PMID:12345678"]
  },
  
  "function_tags": ["sweetener", "flavor_enhancer"],
  "concern_tags": ["artificial", "controversial"],
  
  "last_reviewed": "2026-02-09",
  "confidence": "high"
}
```

### Safety Ratings
| Rating | Meaning | UI Color |
|--------|---------|----------|
| `safe` | No known concerns | Green ✅ |
| `caution` | Limit intake or context-dependent | Yellow ⚠️ |
| `avoid` | Known risk, recommend avoiding | Red 🚫 |
| `unknown` | Insufficient data | Gray ❓ |

---

## Building the Database

### Phase 1: Launch Database (200 ingredients)

**Priority categories:**
1. Artificial sweeteners (aspartame, sucralose, saccharin, etc.)
2. Preservatives (BHA, BHT, sodium nitrate, etc.)
3. Artificial colors (Red 40, Yellow 5, etc.)
4. Emulsifiers (polysorbate 80, carrageenan, etc.)
5. Caffeine sources
6. Herbal ingredients (often risky in pregnancy)
7. High-mercury fish indicators
8. Alcohol derivatives
9. Controversial additives (MSG, etc.)
10. Common allergens (for flagging)

### Phase 2: Expansion (500 ingredients)
- Less common additives
- Natural flavors breakdown
- Vitamin/mineral overdose thresholds
- Regional ingredients (UK, EU, Australia)

### Phase 3: Comprehensive (1000+ ingredients)
- Full additive coverage
- Brand-specific formulations
- International variations

---

## Data Sources

### Primary Sources (High Trust)
| Source | What It Provides |
|--------|------------------|
| FDA GRAS List | Generally Recognized as Safe status |
| WHO/JECFA | International safety assessments |
| EFSA (EU) | European safety opinions |
| American Pregnancy Association | Pregnancy-specific guidance |
| MotherToBaby | Evidence-based pregnancy info |
| PubMed | Primary research studies |

### Secondary Sources (Cross-Reference)
| Source | What It Provides |
|--------|------------------|
| Mayo Clinic | General health guidance |
| WebMD | Consumer health info |
| Healthline | Accessible summaries |
| OB/GYN practice guidelines | Clinical recommendations |

### What We DON'T Use
- Random mommy blogs (unverified)
- Fear-mongering "wellness" sites
- Sources without citations
- Outdated information (pre-2015)

---

## Research Process

### For Each Ingredient:
1. **Identify** — What is it chemically? What names does it go by?
2. **Function** — Why is it used in food? What does it replace?
3. **Safety Literature** — What do FDA/WHO/studies say?
4. **Pregnancy Specific** — Any pregnancy-specific research?
5. **Trimester Variation** — Does risk change by stage?
6. **Practical Guidance** — What should a pregnant woman actually do?
7. **Write Explanation** — Clear, non-scary, educational
8. **Cite Sources** — Link to primary sources
9. **Review** — Second pass for accuracy
10. **Date** — Mark when last reviewed

### Time Estimate
- Simple ingredient (caffeine): 15-20 minutes
- Complex ingredient (controversial additive): 45-60 minutes
- Average: ~30 minutes per ingredient

**200 ingredients × 30 min = ~100 hours of research**

I'll do the heavy lifting. Plan for 2-3 weeks of database building in parallel with development.

---

## AI-Assisted Generation

### What AI Can Do:
- Draft initial explanations from source material
- Identify aliases and alternative names
- Summarize research papers
- Generate "what it is" and "why in food" sections

### What Humans Must Do:
- Verify safety ratings (AI can't be trusted here)
- Final review of all explanations
- Handle controversial/contested ingredients
- Make judgment calls on conflicting data

### Process:
1. I generate draft entries using Claude
2. Cross-reference against primary sources
3. Flag low-confidence entries for deeper review
4. President spot-checks random entries
5. Mark "reviewed by human" in database

---

## Maintenance

### Ongoing Tasks:
- Monitor FDA/EFSA announcements for updates
- Track new research on controversial ingredients
- Add new ingredients as users request
- Update "last reviewed" dates annually

### User Feedback Loop:
- "Report an issue" button on ingredient pages
- Track which ingredients users ask about
- Prioritize database expansion based on demand

---

## Quality Safeguards

| Risk | Safeguard |
|------|-----------|
| Wrong safety rating | Cite sources, conservative defaults |
| Outdated information | Review dates visible, annual updates |
| Missing ingredient | "Unknown" rating, allow user submission |
| Regional variation | Note when EU/US/etc. differ |
| User misinterpretation | Clear disclaimers, "talk to doctor" prompts |

---

## Liability Protection

### Disclaimers (in app):
- "This app provides educational information only"
- "Not a substitute for medical advice"
- "When in doubt, consult your healthcare provider"
- "Safety ratings reflect current research and may change"

### Documentation:
- Log all sources for every ingredient
- Keep dated records of database changes
- Track our research methodology

---

## Starter Ingredients (First 50)

**Artificial Sweeteners:**
Aspartame, Sucralose, Saccharin, Acesulfame-K, Stevia, Monk Fruit, Xylitol, Erythritol, Sorbitol

**Preservatives:**
BHA, BHT, Sodium Nitrate, Sodium Nitrite, Sodium Benzoate, Potassium Sorbate, TBHQ

**Colors:**
Red 40, Yellow 5, Yellow 6, Blue 1, Caramel Color, Titanium Dioxide

**Emulsifiers/Stabilizers:**
Carrageenan, Polysorbate 80, Soy Lecithin, Xanthan Gum, Guar Gum, Cellulose Gum

**Caffeine Sources:**
Caffeine, Green Tea Extract, Guarana, Yerba Mate

**Controversial:**
MSG, "Natural Flavors", High Fructose Corn Syrup, Palm Oil, Partially Hydrogenated Oils

**Herbal (Risky in Pregnancy):**
Licorice Root, Ginseng, Dong Quai, Black Cohosh, Pennyroyal

**Other:**
Alcohol, Sodium, Added Sugars (threshold tracking)

---

## Timeline

| Week | Database Goal |
|------|---------------|
| 1-2 | 50 core ingredients (highest concern) |
| 3-4 | Expand to 150 ingredients |
| 5-6 | Reach 200 (launch minimum) |
| Post-launch | Expand based on user demand |
