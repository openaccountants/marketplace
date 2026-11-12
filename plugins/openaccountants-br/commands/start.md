---
name: start
description: Front door — scope your tax question and get a ready plan with the right skills loaded.
---

The user wants to start a tax/accounting workflow.

If the user hasn't said what they want or which jurisdiction, ask them first.

Then call `openaccountants` MCP `start` with:
- intent: what they said (e.g. "VAT return", "tax filing", "formation", "find deductions")
- jurisdiction: BR

Walk through the returned `skills_to_load` and call `get_skill` for each. Check the fetched skill version's published review record. Name a professional reviewer only when that record identifies one; if the record is missing, describe professional review as unconfirmed. Cite the skill slug and available version or review date. Apply the rules.
