import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// データディレクトリのパス
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'metrics.db');

// データディレクトリが存在しない場合は作成
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// SQLite DB インスタンス
const db = new Database(DB_PATH);

// WALモードを有効化（パフォーマンス向上）
db.pragma('journal_mode = WAL');

// テーブル作成
db.exec(`
  CREATE TABLE IF NOT EXISTS metrics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    min REAL,
    max REAL,
    active INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_metrics_order ON metrics("order");
  CREATE INDEX IF NOT EXISTS idx_metrics_active ON metrics(active);

  CREATE TABLE IF NOT EXISTS data_points (
    id TEXT PRIMARY KEY,
    metric_id TEXT NOT NULL,
    date TEXT NOT NULL,
    value REAL NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (metric_id) REFERENCES metrics(id) ON DELETE CASCADE,
    UNIQUE(metric_id, date)
  );

  CREATE INDEX IF NOT EXISTS idx_data_points_metric_id ON data_points(metric_id);
  CREATE INDEX IF NOT EXISTS idx_data_points_date ON data_points(date);
  CREATE INDEX IF NOT EXISTS idx_data_points_metric_date ON data_points(metric_id, date);
`);

export default db;
