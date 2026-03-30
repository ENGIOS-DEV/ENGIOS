// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 6 — DATA: Feature Flags & Commercial Layer
// AIDA-2 — database/flags.cjs
//
// Responsibility:
//   - Licence management (tier, validity, verification)
//   - Module catalogue (purchasable feature modules)
//   - Module entitlements (what a user has access to)
//   - Feature flags (which features are available at which tier)
//
// Isolation rules:
//   - Imports getDb() from database/schema.cjs — shares the same DB connection
//   - NEVER imported by database/schema.cjs — dependency is one-way only
//   - Core data model has zero knowledge of this file
//   - This file MAY reference core table IDs (e.g. space_id on a module)
//     but never modifies core tables directly
//
// Why isolated:
//   The commercial model will go through several restructures as the
//   business strategy matures. Isolation means those changes never
//   destabilise the core data model or any other layer.
//
// Tier order (lowest → highest):
//   free → silver → gold → platinum
// ═══════════════════════════════════════════════════════════════════════════════

const { getDb } = require('./schema.cjs')

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA
// Called once on startup by database/seeds.cjs after schema.cjs has run.
// ═══════════════════════════════════════════════════════════════════════════════

function initFlagsSchema() {
  const db = getDb()

  // ── Licence ────────────────────────────────────────────────────────────────
  // One row per installation. Seeded with a free tier row on first run.
  // tier:         free | silver | gold | platinum
  // verified:     whether the licence has been validated
  // last_checked: timestamp of the most recent licence verification attempt

  db.exec(`
    CREATE TABLE IF NOT EXISTS licence (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      tier         TEXT    NOT NULL DEFAULT 'free',
      licence_key  TEXT    UNIQUE,
      email        TEXT,
      valid_from   TEXT,
      valid_until  TEXT,
      verified     INTEGER NOT NULL DEFAULT 0,
      last_checked TEXT
    );
  `)

  // ── Module Catalogue ────────────────────────────────────────────────────────
  // The list of all purchasable/subscribable feature modules.
  // pricing_type: subscription | one_time | per_use
  // min_tier:     the minimum licence tier required to purchase this module
  // schema_json:  reserved for future module-specific DB schema extensions

  db.exec(`
    CREATE TABLE IF NOT EXISTS module_catalogue (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      slug         TEXT    NOT NULL UNIQUE,
      name         TEXT    NOT NULL,
      description  TEXT    NOT NULL DEFAULT '',
      icon         TEXT    NOT NULL DEFAULT '📦',
      pricing_type TEXT    NOT NULL DEFAULT 'subscription',
      price        REAL    NOT NULL DEFAULT 0,
      currency     TEXT    NOT NULL DEFAULT 'GBP',
      min_tier     TEXT    NOT NULL DEFAULT 'free',
      schema_json  TEXT    NOT NULL DEFAULT '{}'
    );
  `)

  // ── Module Entitlements ─────────────────────────────────────────────────────
  // Records what a user has purchased or subscribed to.
  // valid_until: null means the entitlement does not expire (one-time purchase)
  // data_preserved: whether the module's data is kept after entitlement expires

  db.exec(`
    CREATE TABLE IF NOT EXISTS module_entitlements (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      module_slug    TEXT    NOT NULL REFERENCES module_catalogue(slug),
      purchase_type  TEXT    NOT NULL DEFAULT 'subscription',
      licence_key    TEXT,
      valid_from     TEXT    NOT NULL DEFAULT (datetime('now')),
      valid_until    TEXT,
      data_preserved INTEGER NOT NULL DEFAULT 1,
      purchased_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  // ── Feature Flags ───────────────────────────────────────────────────────────
  // Controls which features are accessible at which licence tier.
  // module_slug: if set, the feature also requires that module to be entitled.
  // enabled:     master on/off switch — overrides tier/module checks.
  // description: human-readable note on what this flag controls.

  db.exec(`
    CREATE TABLE IF NOT EXISTS feature_flags (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      feature_key TEXT    NOT NULL UNIQUE,
      min_tier    TEXT    NOT NULL DEFAULT 'free',
      module_slug TEXT    REFERENCES module_catalogue(slug),
      enabled     INTEGER NOT NULL DEFAULT 1,
      description TEXT    NOT NULL DEFAULT ''
    );
  `)

  // ── Indexes ─────────────────────────────────────────────────────────────────
  const safeIdx = (sql) => { try { db.exec(sql) } catch (_) {} }
  safeIdx('CREATE INDEX IF NOT EXISTS idx_flags_key         ON feature_flags(feature_key)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_entitlements_slug ON module_entitlements(module_slug)')
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

const TIER_ORDER = ['free', 'silver', 'gold', 'platinum']

function tierRank(tier) {
  const rank = TIER_ORDER.indexOf(tier)
  return rank === -1 ? 0 : rank
}

function tierMeetsMinimum(userTier, requiredTier) {
  return tierRank(userTier) >= tierRank(requiredTier)
}

// ═══════════════════════════════════════════════════════════════════════════════
// LICENCE
// ═══════════════════════════════════════════════════════════════════════════════

function getLicence() {
  return getDb().prepare('SELECT * FROM licence LIMIT 1').get()
}

function updateLicence(changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`UPDATE licence SET ${fields} WHERE id = 1`).run(changes)
  return getLicence()
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════════

function getFeatureFlags() {
  return getDb().prepare(
    'SELECT * FROM feature_flags WHERE enabled = 1'
  ).all()
}

// canUseFeature — the single gating function for all feature access checks.
// Returns true only if:
//   1. The flag exists and is enabled
//   2. The user's tier meets the minimum required tier
//   3. If the flag requires a module — the user has a valid entitlement for it

function canUseFeature(featureKey) {
  const licence = getLicence()
  const flag    = getDb().prepare(
    'SELECT * FROM feature_flags WHERE feature_key = ?'
  ).get(featureKey)

  if (!flag || !flag.enabled) return false
  if (!tierMeetsMinimum(licence?.tier ?? 'free', flag.min_tier)) return false

  if (flag.module_slug) {
    const entitlement = getDb().prepare(`
      SELECT * FROM module_entitlements
      WHERE module_slug = ?
        AND (valid_until IS NULL OR valid_until > datetime('now'))
    `).get(flag.module_slug)
    if (!entitlement) return false
  }

  return true
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE CATALOGUE
// ═══════════════════════════════════════════════════════════════════════════════

function getModuleCatalogue() {
  return getDb().prepare('SELECT * FROM module_catalogue').all()
}

function getModule(slug) {
  return getDb().prepare(
    'SELECT * FROM module_catalogue WHERE slug = ?'
  ).get(slug)
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE ENTITLEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

function getModuleEntitlements() {
  return getDb().prepare('SELECT * FROM module_entitlements').all()
}

function hasModuleEntitlement(slug) {
  const row = getDb().prepare(`
    SELECT * FROM module_entitlements
    WHERE module_slug = ?
      AND (valid_until IS NULL OR valid_until > datetime('now'))
  `).get(slug)
  return !!row
}

function addModuleEntitlement({
  module_slug,
  purchase_type  = 'subscription',
  licence_key    = null,
  valid_from     = null,
  valid_until    = null,
  data_preserved = 1,
}) {
  const r = getDb().prepare(`
    INSERT INTO module_entitlements
      (module_slug, purchase_type, licence_key, valid_from, valid_until, data_preserved)
    VALUES
      (@module_slug, @purchase_type, @licence_key,
       COALESCE(@valid_from, datetime('now')), @valid_until, @data_preserved)
  `).run({ module_slug, purchase_type, licence_key, valid_from, valid_until, data_preserved })
  return getDb().prepare(
    'SELECT * FROM module_entitlements WHERE id = ?'
  ).get(r.lastInsertRowid)
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  initFlagsSchema,

  // Tier utilities
  TIER_ORDER,
  tierRank,
  tierMeetsMinimum,

  // Licence
  getLicence,
  updateLicence,

  // Feature flags
  getFeatureFlags,
  canUseFeature,

  // Module catalogue
  getModuleCatalogue,
  getModule,

  // Module entitlements
  getModuleEntitlements,
  hasModuleEntitlement,
  addModuleEntitlement,
}
