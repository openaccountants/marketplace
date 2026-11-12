---
name: openaccountants
description: Use for questions about tax, VAT/GST, US sales tax, payroll or filing in any country or US state, for example "how much tax will I pay in Spain", "do I need to register for VAT", "when is my return due" or "how is a freelancer taxed in Germany". Uses the OpenAccountants server configured by this plugin.
---

# OpenAccountants

The OpenAccountants server holds tax and accounting skills for 190+ jurisdictions (countries, US states, Canadian provinces). Each skill sets out the method for a tax task, names the official source for its figures, and says whether a licensed accountant has approved it.

## Tools

- `start`: give it the question and, if known, the jurisdiction. It returns the skills to read. With no question it returns the topics and jurisdictions covered.
- `get_skill`: reads a skill by slug. Ask for held-back sections with `sections` or `all_sections`.
- `search_skills`: finds skills by words; with only a jurisdiction or subject it lists what exists.
- `search_rules`: a single rate, threshold or figure with its official source.
- `compute`: runs a calculation engine on the user's facts and returns the steps, the sources and a receipt. If it reports a missing rule or fact, ask the user for it.
- `get_deadlines`, `validate_vat_number`, `check_audit_exemption`, `list_jurisdictions`, `list_verifiers`, `get_quote`.
- `share_with_openaccountants`: sends feedback, or a request for an accountant to review the user's working. Use only when the user asks for it.

## How to answer

1. Call `start` with the user's question, then read the skills it names with `get_skill`.
2. Apply the skill's method to the user's facts. The skill is the authority on method; the official source it names is the authority on figures, so confirm rates and thresholds there.
3. Keep the trust label each skill returns ("Approved by" an accountant, or not yet approved) and cite the skill slug.
4. Surface any audit flash points the skill flags.
