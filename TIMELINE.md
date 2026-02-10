# Development Timeline
## Pregnancy-Safe Scanner — MVP Launch

---

## Overview

| Phase | Duration | End State |
|-------|----------|-----------|
| Foundation | Weeks 1-2 | Core app structure, database, scanning works |
| Safety Engine | Weeks 3-4 | Ingredient analysis, explanations, UI complete |
| Polish & Test | Weeks 5-6 | Bug fixes, onboarding, beta testing |
| Launch Prep | Weeks 7-8 | App Store submission, marketing assets |
| **Total** | **8 weeks** | **Live in App Store + Web** |

---

## Week-by-Week Breakdown

### Week 1: Foundation
| Task | Owner | Deliverable |
|------|-------|-------------|
| Set up repo + Next.js project | Gladys | GitHub repo, basic app shell |
| Configure Supabase | Gladys | Database tables, auth working |
| Implement barcode scanner | Gladys | Camera → barcode → number |
| Connect Open Food Facts API | Gladys | Barcode → product data |
| **Checkpoint** | | Can scan product, see raw data |

### Week 2: Data Layer
| Task | Owner | Deliverable |
|------|-------|-------------|
| Build ingredient safety database | Gladys | Top 200 concerning ingredients rated |
| Parse ingredient lists | Gladys | Extract ingredients from product data |
| Create safety analysis logic | Gladys | Ingredient → safety rating |
| Design database schema | Gladys | All tables finalized |
| **Checkpoint** | | Scan → safety rating (basic) |

### Week 3: Core Experience
| Task | Owner | Deliverable |
|------|-------|-------------|
| Build product results screen | Gladys | Clean UI showing safety summary |
| Add ingredient detail views | Gladys | Tap → full explanation |
| Implement trimester logic | Gladys | Ratings adjust by trimester |
| Generate ingredient explanations | Gladys | AI-written "why" content |
| **Checkpoint** | | Full scan → result → detail flow |

### Week 4: User Features
| Task | Owner | Deliverable |
|------|-------|-------------|
| User onboarding flow | Gladys | Due date, preferences captured |
| Scan history | Gladys | Save + view past scans |
| Search functionality | Gladys | Find products without scanning |
| Offline mode (basic) | Gladys | Cached data works without internet |
| **Checkpoint** | | Complete user experience |

### Week 5: Polish
| Task | Owner | Deliverable |
|------|-------|-------------|
| UI/UX refinement | Both | Looks professional, feels trustworthy |
| Error handling | Gladys | Graceful failures, clear messages |
| Performance optimization | Gladys | Fast load, smooth scanning |
| Expand ingredient database | Gladys | 300+ ingredients rated |
| **Checkpoint** | | App feels "ready" |

### Week 6: Testing
| Task | Owner | Deliverable |
|------|-------|-------------|
| Internal testing | Both | Bug list created + fixed |
| Beta testers (5-10 people) | President | Real feedback from pregnant women |
| Fix critical issues | Gladys | Blockers resolved |
| Finalize copy/content | Both | All text reviewed |
| **Checkpoint** | | Beta approved, ready for launch |

### Week 7: Launch Prep
| Task | Owner | Deliverable |
|------|-------|-------------|
| Create App Store assets | Both | Screenshots, description, keywords |
| Write privacy policy | Gladys | Legal page complete |
| Set up analytics | Gladys | Track key metrics |
| Submit to App Store | President | In review queue |
| Launch PWA version | Gladys | Web app live immediately |
| **Checkpoint** | | PWA live, native pending approval |

### Week 8: Launch
| Task | Owner | Deliverable |
|------|-------|-------------|
| App Store approval (hopefully) | Apple | App live |
| Launch marketing push | Both | Social, communities, PR |
| Monitor + hotfix | Gladys | Quick response to issues |
| Gather initial feedback | Both | User interviews, reviews |
| **Checkpoint** | | WE'RE LIVE 🚀 |

---

## Aggressive Timeline (If We Push)

| Phase | Aggressive | Comfortable |
|-------|------------|-------------|
| MVP functional | 4 weeks | 6 weeks |
| Launch ready | 6 weeks | 8 weeks |
| In App Store | 7 weeks | 9 weeks |

**My recommendation:** Plan for 8 weeks, celebrate if faster.

---

## Dependencies & Blockers

| Dependency | Risk | Mitigation |
|------------|------|------------|
| Apple review time | 1-7 days unpredictable | Submit early, have PWA as backup |
| Ingredient data quality | Time-consuming to research | Start with "known bad" list, expand |
| Beta tester availability | Need pregnant women | President's network, Reddit, Facebook groups |
| Design quality | Neither of us is a designer | Use clean templates, hire for polish later |

---

## Milestones

| Date | Milestone |
|------|-----------|
| Week 2 end | Can scan and see safety result |
| Week 4 end | Full user experience working |
| Week 6 end | Beta testing complete |
| Week 8 end | PUBLIC LAUNCH |

---

## Start Date

**If we start today (Feb 9, 2026):**
- Week 4 checkpoint: March 9
- Week 6 checkpoint: March 23
- Launch target: **April 6, 2026**

Let's fucking go.
