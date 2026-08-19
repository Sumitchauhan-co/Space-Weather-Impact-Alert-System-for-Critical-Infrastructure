import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "space_weather.db"


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                time_tag TEXT NOT NULL,
                kp REAL,
                dst REAL,
                solar_wind_speed REAL,
                bz REAL,
                xray_flux REAL,
                proton_flux REAL,
                overall_score REAL,
                overall_level TEXT,
                source TEXT NOT NULL DEFAULT 'live',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS alert_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                triggered_at TEXT DEFAULT CURRENT_TIMESTAMP,
                overall_level TEXT NOT NULL,
                overall_score REAL NOT NULL,
                message TEXT NOT NULL,
                source TEXT NOT NULL DEFAULT 'live'
            )
            """
        )
        conn.commit()


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def insert_reading(row: dict, source: str = "live") -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO readings
                (time_tag, kp, dst, solar_wind_speed, bz, xray_flux,
                 proton_flux, overall_score, overall_level, source)
            VALUES (:time_tag, :kp, :dst, :solar_wind_speed, :bz, :xray_flux,
                    :proton_flux, :overall_score, :overall_level, :source)
            """,
            {**row, "source": source},
        )
        conn.commit()


def get_history(hours: int = 24, source: str = "live") -> list[dict]:
    with get_conn() as conn:
        cursor = conn.execute(
            """
            SELECT * FROM readings
            WHERE source = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (source, hours * 12),  # ~ up to one reading per 5 min
        )
        rows = [dict(r) for r in cursor.fetchall()]
        rows.reverse()
        return rows


def log_alert(overall_level: str, overall_score: float, message: str, source: str = "live") -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO alert_log (overall_level, overall_score, message, source)
            VALUES (?, ?, ?, ?)
            """,
            (overall_level, overall_score, message, source),
        )
        conn.commit()


def get_recent_alerts(limit: int = 20) -> list[dict]:
    with get_conn() as conn:
        cursor = conn.execute(
            "SELECT * FROM alert_log ORDER BY triggered_at DESC LIMIT ?",
            (limit,),
        )
        return [dict(r) for r in cursor.fetchall()]


def clear_replay_readings() -> None:
    with get_conn() as conn:
        conn.execute("DELETE FROM readings WHERE source = 'replay'")
        conn.commit()
