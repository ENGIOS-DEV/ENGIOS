// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 6 — DATA: Seeds
// AIDA-2 — database/seeds.cjs
//
// Responsibility:
//   - Default data for both schema.cjs and flags.cjs
//   - Runs AFTER both initSchema() and initFlagsSchema()
//   - INSERT OR IGNORE throughout — always safe to re-run on startup
//   - Never modifies existing data — only fills gaps
//
// Sections:
//   1. CORE SEEDS    — default settings values
//   2. FLAGS SEEDS   — free licence row, feature flags, module catalogue
//
// Rules:
//   - No logic here — only data
//   - No hardcoded IDs — use INSERT OR IGNORE with unique keys/slugs
//   - If a seed needs to change — add a migration in schema.cjs instead
//     (seeds only run once per key/slug, migrations handle updates)
// ═══════════════════════════════════════════════════════════════════════════════

const { getDb }       = require('./schema.cjs')
const { initFlagsSchema } = require('./flags.cjs')

function runSeeds() {
  initFlagsSchema()
  seedCore()
  seedFlags()
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — CORE SEEDS
// Default values for the settings table.
// These are the application defaults — overwritten by user preferences at runtime.
// ═══════════════════════════════════════════════════════════════════════════════

function seedCore() {
  const db = getDb()

  // Default GlobalSettings seed
  // Mirrors the defaultSettings object in src/types/settings.ts
  // Only inserted if the key does not already exist.

  const defaultSettings = {
    'aida-settings': JSON.stringify({
      theme:               'dark',
      transparency:        20,
      blurIntensity:       40,
      accentColor:         '#3982F4',
      fontSize:            'medium',
      animationSpeed:      'normal',
      autoHideMenu:        false,
      autoHideDelay:       3,
      defaultMenuState:    'closed',
      providerKeepSession: false,
      aiProvider:          'gemini',
      geminiApiKey:        '',
      showClockWidget:     true,
      autoStart:           false,
      userName:            '',
      showWelcome:         true,
    }),
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (@key, @value)
  `)

  db.transaction(() => {
    Object.entries(defaultSettings).forEach(([key, value]) => {
      insert.run({ key, value })
    })
  })()
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — FLAGS SEEDS
// Free licence row, feature flags, and module catalogue.
// Isolated here so commercial data can be re-seeded independently
// without touching core data seeds.
// ═══════════════════════════════════════════════════════════════════════════════

function seedFlags() {
  const db = getDb()

  // ── Free licence row ────────────────────────────────────────────────────────
  // Every installation starts on the free tier.
  // Only inserted if no licence row exists yet.

  const existingLicence = db.prepare('SELECT id FROM licence LIMIT 1').get()
  if (!existingLicence) {
    db.prepare(`
      INSERT INTO licence (tier, verified) VALUES ('free', 1)
    `).run()
  }

  // ── Feature flags ───────────────────────────────────────────────────────────
  // Format: [feature_key, min_tier, module_slug, description]
  // module_slug null = available to any user who meets the tier requirement
  // INSERT OR IGNORE — existing flags are never overwritten by seeds

  const flags = [
    // ── Core features ──────────────────────────────────────────────────────
    ['core.chat',              'free',     null, 'AIDA Chat — local AI conversation'],
    ['core.tasks',             'free',     null, 'Tasks — simple task management'],
    ['core.notes',             'free',     null, 'Notes — free-form note taking'],
    ['core.calendar',          'free',     null, 'Calendar — event management'],
    ['core.file-decks',        'free',     null, 'File Decks — file manager and editor'],
    ['core.spaces.custom',     'free',     null, 'Custom spaces — up to 3 spaces'],
    ['core.spaces.unlimited',  'silver',   null, 'Unlimited spaces'],

    // ── Views ─────────────────────────────────────────────────────────────
    ['views.table',            'free',     null, 'Table view'],
    ['views.list',             'free',     null, 'List view'],
    ['views.board',            'silver',   null, 'Board / Kanban view'],
    ['views.calendar',         'gold',     null, 'Calendar view'],
    ['views.timeline',         'gold',     null, 'Timeline / Gantt view'],
    ['views.gallery',          'gold',     null, 'Gallery view'],

    // ── Data ──────────────────────────────────────────────────────────────
    ['data.relations',         'gold',     null, 'Record relations between collections'],
    ['data.formula_fields',    'gold',     null, 'Formula / computed fields'],
    ['data.tags',              'silver',   null, 'Tags on records'],

    // ── AI ────────────────────────────────────────────────────────────────
    ['ai.providers.one',       'free',     null, 'One AI provider'],
    ['ai.providers.three',     'silver',   null, 'Up to three AI providers'],
    ['ai.providers.unlimited', 'gold',     null, 'Unlimited AI providers'],
    ['ai.memory.7day',         'free',     null, 'AIDA memory — 7 day retention'],
    ['ai.memory.30day',        'silver',   null, 'AIDA memory — 30 day retention'],
    ['ai.memory.90day',        'gold',     null, 'AIDA memory — 90 day retention'],
    ['ai.memory.unlimited',    'platinum', null, 'AIDA memory — unlimited retention'],
    ['ai.suggestions.basic',   'silver',   null, 'Basic AIDA proactive suggestions'],
    ['ai.suggestions.full',    'gold',     null, 'Full AIDA proactive suggestions'],
    ['ai.persona.custom',      'platinum', null, 'Custom AIDA persona and system prompt'],
    ['ai.crossspace',          'platinum', null, 'AIDA cross-space context awareness'],

    // ── Modules ───────────────────────────────────────────────────────────
    ['modules.purchase',       'silver',   null, 'Ability to purchase feature modules'],
  ]

  const insertFlag = db.prepare(`
    INSERT OR IGNORE INTO feature_flags (feature_key, min_tier, module_slug, description)
    VALUES (@feature_key, @min_tier, @module_slug, @description)
  `)

  db.transaction(() => {
    flags.forEach(([feature_key, min_tier, module_slug, description]) => {
      insertFlag.run({ feature_key, min_tier, module_slug, description })
    })
  })()

  // ── Module catalogue ────────────────────────────────────────────────────────
  // Format: [slug, name, description, icon, pricing_type, price, min_tier]
  // INSERT OR IGNORE — existing modules are never overwritten by seeds
  // Prices are in GBP. Currency stored per-row for future multi-currency support.

  const modules = [
    ['health',   'Health Suite',     'Workouts, nutrition, sleep, body stats, symptoms',  '💪', 'subscription', 4.99,  'silver'],
    ['finance',  'Finance Tracker',  'Budget, transactions, accounts, bills, goals',       '💰', 'subscription', 4.99,  'silver'],
    ['wedding',  'Wedding Planner',  'Guests, vendors, budget, timeline, RSVP',            '💍', 'one_time',     19.99, 'free'  ],
    ['travel',   'Travel Planner',   'Itinerary, packing, bookings, expenses per trip',    '✈️', 'per_use',       2.99, 'free'  ],
    ['business', 'Business Tracker', 'Clients, projects, invoices, time tracking',         '📊', 'subscription', 7.99,  'silver'],
    ['home',     'Home Manager',     'Maintenance, appliances, warranties, utilities',     '🏠', 'one_time',     14.99, 'free'  ],
    ['baby',     'Baby Tracker',     'Feeds, sleep, milestones, health, growth charts',    '👶', 'one_time',      9.99, 'free'  ],
    ['study',    'Study Planner',    'Courses, assignments, deadlines, revision schedule', '🎓', 'subscription', 3.99,  'free'  ],
  ]

  const insertModule = db.prepare(`
    INSERT OR IGNORE INTO module_catalogue
      (slug, name, description, icon, pricing_type, price, min_tier)
    VALUES
      (@slug, @name, @description, @icon, @pricing_type, @price, @min_tier)
  `)

  db.transaction(() => {
    modules.forEach(([slug, name, description, icon, pricing_type, price, min_tier]) => {
      insertModule.run({ slug, name, description, icon, pricing_type, price, min_tier })
    })
  })()
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = { runSeeds }
