# MACKARY FINANCE

A mobile-friendly personal expense tracker for Zambian Kwacha (ZMW), packaged as an installable Progressive Web App (PWA). Its warm white workspace and white, red, and gold logo with red interface accents are carried through the interface and home-screen icon. No build step is required.

## Publish it for your phone

The app needs to be hosted at an **HTTPS** web address for installation and offline support. Opening `index.html` directly from your computer is useful for a desktop preview, but does not enable PWA installation.

One straightforward option is GitHub Pages:

1. Create a GitHub repository and upload **all files in this folder** (`index.html`, `manifest.webmanifest`, `sw.js`, and the icon files) to the repository's root.
2. In the repository settings, open **Pages** and enable publishing from the `main` branch and `/ (root)`.
3. Wait for GitHub Pages to provide your HTTPS site link, then open that link on your phone.
4. On **iPhone**, open the link in Safari, tap **Share**, then **Add to Home Screen**. Enable **Open as Web App** if the option appears. The app’s **Install app** button also shows these steps.
5. On **Android**, open the link in Chrome, tap **More (⋮)**, then choose **Install app** or **Add to Home screen**. The app’s **Install app** button also shows these steps.

Any static host that serves these files over HTTPS also works. After the first successful visit, the app shell can load offline. Expense records and budget remain in that phone's browser storage; they do not sync between devices. Use **Monthly reports → Download backup** to save a full JSON backup and **Restore backup** to load it on this device; restore replaces the current stored records. Keep backup files private. **Export CSV** remains available for spreadsheets. Search recent expenses by text, category, payment method, or month. Monthly reports compare income, spending, and savings with the previous month. Monthly recurring transactions are recorded once you open the app on or after their scheduled day. Budget warnings appear when spending reaches 80% of or passes your monthly or planned category limit.

## Features

- Dashboard with all-time, today, current week, and current month totals
- Record income by source, date, and payment method, with an income history
- Expected income planning by month, individual, and purpose; expected amounts stay separate from received income
- Cash, bank, and mobile money balances based on the opening amounts you set and later recorded transactions
- Available balance that accounts for recorded income, expenses, and savings set aside
- Savings accounts with current balances, targets, deposits, and withdrawals
- Investment portfolio with invested amounts, contributions, current values, and automatic gain or loss totals
- A built-in Emergency fund account, ready for a target and contributions
- Suggested category shares of monthly income, with actual shares and overspend indicators
- Monthly budget with editable limit and progress indicator
- Monthly expenditure planner with separate saved category limits for each month
- Debt tracker with separate outstanding totals, due dates, repayment records, additional borrowing, and separate total owed, paid, and outstanding amounts
- Weekly spending totals and daily breakdown from Sunday to Saturday, with monthly and yearly chart views; monthly category breakdown and recent expenses
- Expense form with amount, category, date, payment method, and description
- Search and filters for expenses by text, category, payment method, and month
- Monthly reports comparing income, spending, savings, and category totals with the prior month
- Monthly recurring expense and income schedules that record when the app is opened after the due day
- JSON backup download and restore on this device
- Warnings when spending reaches 80% of or exceeds monthly and planned category budgets
- CSV export for expense, income, and savings account transactions
- Persistent local browser storage
- Responsive layout, home-screen icon, and offline app shell
- Password setup and a lock screen for this browser session
- First-run Individual or Business account profile setup

In **Income → Expected income**, add each expected payment with the individual, amount, month, and purpose. Select a month to see its list and expected total. These are forecasts and do not affect actual income or balances until recorded under **Record income**.

The first time you open the app, choose **Individual** or **Business**, enter a name, and create a password of at least 8 characters; later visits ask you to unlock it. Use **Lock** in the header to lock the current session. The browser stores a salted password hash, not the password itself. This static, browser-only account is a local profile and privacy screen, not a synced online account or strong security: saved financial records remain in browser storage and are not encrypted. Do not use it for sensitive records on a shared device. For secure multi-device accounts, the app needs a protected server and encrypted data storage. Password recovery is not available.

Recurring schedules create one record for the current month the first time the app is opened on or after their scheduled day; a schedule added after that day begins next month. The app starts with empty expense, income, and debt lists, zeroed tracked cash/bank/mobile balances, a K5,000 monthly budget, and an Emergency fund account with a K0.00 balance. Set your starting balances from the Income screen; subsequent Cash, Bank Transfer, Debit Card, Mastercard, and Mobile Money records update the matching balance. Savings deposits and withdrawals ask which balance they come from or return to. In **Expenditure planner**, choose a month, enter a planned limit for each category, and save it; actual recorded spending is compared with those limits. Each month has a separate plan. In **Debt tracker**, record debts you owe and debts owed to you, then log partial or full payments and add later borrowing to the same record. Outstanding balances recalculate as total borrowed minus total paid. Expense categories: Food, Transport, Rent, Bills, Shopping, Business, Education, Entertainment, Health, Airtime/Data, Savings, and Other. Category percentages are a sample breakdown inspired by the common 50/30/20 budgeting guideline; the detailed category splits are illustrative and may need adjustment for your circumstances. Existing savings goals migrate into accounts the first time the updated app opens.
