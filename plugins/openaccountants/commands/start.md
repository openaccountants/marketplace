---
name: start
description: Start a tax or accounting question and load the skills that answer it.
---

Ask the user what they want to do and in which country or US state, if they have not said.

Then call the `openaccountants` server's `start` tool with their question as `intent` and the jurisdiction. Read each skill it names with `get_skill`, apply it to the user's facts and cite the skill slug.
