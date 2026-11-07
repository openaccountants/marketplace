# OpenAccountants for Claude Code

Tax and accounting skills for 190+ jurisdictions. Each skill sets out the method for a tax task, names the official source for its figures, and says whether a licensed accountant has approved it.

The plugin connects Claude Code to the OpenAccountants server (`https://www.openaccountants.com/api/mcp`) and adds one skill and three commands.

## Install

```bash
claude plugin marketplace add openaccountants/marketplace
claude plugin install openaccountants@OpenAccountants
```

## Commands

- `/start`: start a tax or accounting question and load the skills that answer it.
- `/skills`: list the skills for a country, US state or subject.
- `/review`: ask for a licensed accountant to review your working.

Other apps (Claude.ai, ChatGPT, Cursor): see [openaccountants.com/connect](https://www.openaccountants.com/connect).

## Not tax advice

Answers are working papers, not filed returns. Have a qualified professional review them before you file.

## License

MIT for this plugin. Skill content: see [openaccountants/openaccountants](https://github.com/openaccountants/openaccountants).
