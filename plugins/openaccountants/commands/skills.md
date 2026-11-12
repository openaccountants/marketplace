---
name: skills
description: List the OpenAccountants skills for a country, US state or subject.
---

Ask which country, US state or subject the user means, if they have not said.

Call the `openaccountants` server's `search_skills` tool with only `jurisdiction` (and `domain` if given) to list the skills. Show them as a numbered list of slug and one-line description.
