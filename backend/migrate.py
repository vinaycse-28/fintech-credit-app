import sqlite3
import os

def run_migrations(db_path=None):
    if db_path is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(base_dir, "creditbridge.db")

    if not os.path.exists(db_path):
        print(f"[Migration] Database file not found at {db_path}. It will be created when SQLAlchemy initializes.")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    try:
        # 1. Create users table if not exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(64) PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email)")
        cur.execute("CREATE INDEX IF NOT EXISTS ix_users_id ON users (id)")

        # 2. Check if user_id column exists in businesses table
        cur.execute("PRAGMA table_info(businesses)")
        columns = [row[1] for row in cur.fetchall()]

        if "user_id" not in columns:
            print("[Migration] Adding user_id column to businesses table...")
            cur.execute("ALTER TABLE businesses ADD COLUMN user_id VARCHAR(64) REFERENCES users(id)")
            cur.execute("CREATE INDEX IF NOT EXISTS ix_businesses_user_id ON businesses (user_id)")
            print("[Migration] user_id column added successfully.")
        else:
            print("[Migration] user_id column already present in businesses table.")

        conn.commit()
        print("[Migration] Safe migration completed successfully.")
    except Exception as e:
        conn.rollback()
        print(f"[Migration Error] {e}")
        raise e
    finally:
        conn.close()

if __name__ == "__main__":
    run_migrations()
