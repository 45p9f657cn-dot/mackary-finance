CREATE TABLE IF NOT EXISTS devices (
  token_hash TEXT PRIMARY KEY,
  subscription_json TEXT NOT NULL,
  reminder_plan_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sent_reminders (
  token_hash TEXT NOT NULL,
  reminder_id TEXT NOT NULL,
  remind_on TEXT NOT NULL,
  sent_at INTEGER NOT NULL,
  PRIMARY KEY (token_hash, reminder_id, remind_on)
);

CREATE INDEX IF NOT EXISTS idx_sent_reminders_sent_at ON sent_reminders(sent_at);
