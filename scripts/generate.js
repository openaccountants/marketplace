#!/usr/bin/env node
/**
 * Generator for openaccountants-marketplace.
 *
 * Reads all skill .md files from the OpenAccountants source repo
 * (../openaccountants-push/packages) and emits a marketplace.json + one
 * plugin folder per:
 *  - Jurisdiction (e.g. malta, germany, us-ca) — if it has >= 3 skills
 *  - Topical category (crypto, transfer-pricing, formation, payroll, …) —
 *    aggregated across jurisdictions
 *  - Vertical (saas, ecommerce, freelance-developer, …) — already grouped
 *    in source/packages/_verticals/
 *
 * Each plugin is a LIGHT router: a .mcp.json pointing at our hosted MCP,
 * a tiny SKILL.md that tells Claude when to invoke it, scoped slash
 * commands, and a README. The actual rule content stays on the MCP
 * server — plugins don't bundle skill bodies (one source of truth,
 * sub-KB per plugin).
 */

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = path.resolve(__dirname, "..", "..", "openaccountants-push", "packages");
const OUT_DIR = path.resolve(__dirname, "..", "plugins");
const MARKETPLACE_PATH = path.resolve(__dirname, "..", ".claude-plugin", "marketplace.json");
const MCP_URL = "https://www.openaccountants.com/api/mcp";
const MIN_SKILLS_PER_PLUGIN = 3;

// Minimal jurisdiction code → label map (extend as needed).
const JURISDICTION_LABEL = {
  AD: "Andorra", AE: "United Arab Emirates", AL: "Albania", AR: "Argentina",
  AT: "Austria", AU: "Australia", AZ: "Azerbaijan", BA: "Bosnia & Herzegovina",
  BD: "Bangladesh", BE: "Belgium", BG: "Bulgaria", BH: "Bahrain",
  BM: "Bermuda", BO: "Bolivia", BR: "Brazil", BS: "Bahamas",
  BW: "Botswana", BY: "Belarus", CA: "Canada", CH: "Switzerland",
  CL: "Chile", CM: "Cameroon", CN: "China", CO: "Colombia",
  CR: "Costa Rica", CY: "Cyprus", CZ: "Czechia", DE: "Germany",
  DK: "Denmark", DO: "Dominican Republic", DZ: "Algeria", EC: "Ecuador",
  EE: "Estonia", EG: "Egypt", ES: "Spain", ET: "Ethiopia",
  FI: "Finland", FR: "France", GB: "United Kingdom", GE: "Georgia",
  GG: "Guernsey", GH: "Ghana", GI: "Gibraltar", GR: "Greece",
  GT: "Guatemala", HK: "Hong Kong", HN: "Honduras", HR: "Croatia",
  HU: "Hungary", ID: "Indonesia", IE: "Ireland", IL: "Israel",
  IM: "Isle of Man", IN: "India", IQ: "Iraq", IS: "Iceland",
  IT: "Italy", JE: "Jersey", JM: "Jamaica", JO: "Jordan",
  JP: "Japan", KE: "Kenya", KG: "Kyrgyzstan", KH: "Cambodia",
  KR: "South Korea", KW: "Kuwait", KY: "Cayman Islands", KZ: "Kazakhstan",
  LB: "Lebanon", LI: "Liechtenstein", LK: "Sri Lanka", LT: "Lithuania",
  LU: "Luxembourg", LV: "Latvia", LY: "Libya", MA: "Morocco",
  MC: "Monaco", MD: "Moldova", ME: "Montenegro", MK: "North Macedonia",
  MN: "Mongolia", MO: "Macau", MT: "Malta", MU: "Mauritius",
  MV: "Maldives", MX: "Mexico", MY: "Malaysia", NA: "Namibia",
  NG: "Nigeria", NI: "Nicaragua", NL: "Netherlands", NO: "Norway",
  NP: "Nepal", NZ: "New Zealand", OM: "Oman", PA: "Panama",
  PE: "Peru", PH: "Philippines", PK: "Pakistan", PL: "Poland",
  PR: "Puerto Rico", PT: "Portugal", PY: "Paraguay", QA: "Qatar",
  RO: "Romania", RS: "Serbia", RU: "Russia", RW: "Rwanda",
  SA: "Saudi Arabia", SB: "Solomon Islands", SC: "Seychelles", SD: "Sudan",
  SE: "Sweden", SG: "Singapore", SI: "Slovenia", SK: "Slovakia",
  SM: "San Marino", SN: "Senegal", SR: "Suriname", SV: "El Salvador",
  TH: "Thailand", TJ: "Tajikistan", TM: "Turkmenistan", TN: "Tunisia",
  TR: "Turkey", TT: "Trinidad & Tobago", TW: "Taiwan", TZ: "Tanzania",
  UA: "Ukraine", UG: "Uganda", US: "United States", UY: "Uruguay",
  UZ: "Uzbekistan", VE: "Venezuela", VG: "British Virgin Islands",
  VN: "Vietnam", XK: "Kosovo", YE: "Yemen", ZA: "South Africa",
  ZM: "Zambia", ZW: "Zimbabwe",
  // US states
  "US-AL": "Alabama", "US-AK": "Alaska", "US-AZ": "Arizona", "US-AR": "Arkansas",
  "US-CA": "California", "US-CO": "Colorado", "US-CT": "Connecticut",
  "US-DE": "Delaware", "US-FL": "Florida", "US-GA": "Georgia (US)",
  "US-HI": "Hawaii", "US-ID": "Idaho", "US-IL": "Illinois", "US-IN": "Indiana",
  "US-IA": "Iowa", "US-KS": "Kansas", "US-KY": "Kentucky", "US-LA": "Louisiana",
  "US-ME": "Maine", "US-MD": "Maryland", "US-MA": "Massachusetts",
  "US-MI": "Michigan", "US-MN": "Minnesota", "US-MS": "Mississippi",
  "US-MO": "Missouri", "US-MT": "Montana", "US-NE": "Nebraska", "US-NV": "Nevada",
  "US-NH": "New Hampshire", "US-NJ": "New Jersey", "US-NM": "New Mexico",
  "US-NY": "New York", "US-NC": "North Carolina", "US-ND": "North Dakota",
  "US-OH": "Ohio", "US-OK": "Oklahoma", "US-OR": "Oregon", "US-PA": "Pennsylvania",
  "US-RI": "Rhode Island", "US-SC": "South Carolina", "US-SD": "South Dakota",
  "US-TN": "Tennessee", "US-TX": "Texas", "US-UT": "Utah", "US-VT": "Vermont",
  "US-VA": "Virginia", "US-WA": "Washington", "US-WV": "West Virginia",
  "US-WI": "Wisconsin", "US-WY": "Wyoming", "US-DC": "Washington DC",
  "US-PR": "Puerto Rico (US)",
  // Canadian provinces (CA + sub-region — but we treat full CA as one)
  // Cross-cutting / global
  GLOBAL: "Global (cross-border)",
  INTL: "International",
  EU: "European Union",
};

// Cross-cutting topical category → slug + label + description.
const TOPICAL_PLUGINS = {
  crypto: {
    slug: "crypto-tax",
    label: "Crypto Tax",
    owner: {
      name: "OpenAccountants",
      url: "https://openaccountants.com",
      email: "hello@openaccountants.com",
    },
    plugins: [
      {
        name: "openaccountants",
        source: "./plugins/openaccountants",
        description:
          "Tax and accounting skills for 190+ jurisdictions, each with its official source and its approval status.",
        category: "tax-accounting",
      },
      ...generated.map((g) => ({
        name: g.slug,
        source: `./plugins/${g.slug}`,
        description: `OpenAccountants ${g.label}. ${g.verifier ? "Professional review varies by skill version; check its published review status." : `${g.skillCount} skill(s).`}`,
        category: "tax-accounting",
      })),
    ],
  };
  writeJSON(MARKETPLACE_PATH, marketplace);

  // Summary
  console.log(`\n✓ Generated ${marketplace.plugins.length} plugins`);
  console.log(`  - 1 base plugin`);
  console.log(`  - ${generated.filter((g) => !g.kind).length} jurisdiction plugins`);
  console.log(`  - ${generated.filter((g) => g.kind === "topical").length} topical plugins`);
  console.log(`  - ${generated.filter((g) => g.kind === "vertical").length} vertical plugins`);
  console.log(`  - ${generated.filter((g) => g.verifier).length} carry a named verifier`);
  console.log(`\nMarketplace manifest: ${MARKETPLACE_PATH}`);
  console.log(`Plugin folders:        ${OUT_DIR}`);
}

main();
