import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="1234"
    )

def fetch_policies_by_id(policy_id):
    conn = get_connection()  # <-- define connection here
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM "Policies" WHERE id = %s', (policy_id,))
    policies = cur.fetchall()
    cur.close()
    conn.close()  # <-- close connection after use
    return policies

def fetch_policies(last_ingested_id=None):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if last_ingested_id:
        cur.execute(
            'SELECT * FROM "Policies" WHERE id > %s ORDER BY id ASC',
            (last_ingested_id,)
        )
    else:
        cur.execute('SELECT * FROM "Policies" ORDER BY id ASC')

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows
