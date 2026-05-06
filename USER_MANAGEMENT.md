# User Management Guide for Casiopony Admin

## If Someone Wants to Change Their Username

### Step 1: Get Their Email
Ask them: "What email did you sign up with?"
Example: sarah@example.com

### Step 2: Connect to Your Database
You have two options:

#### Option A: Using pgAdmin (GUI - Easiest)
1. Go to Railway dashboard → your PostgreSQL plugin
2. Click "Data" tab
3. Find the connection string
4. Use pgAdmin: https://www.pgadmin.org/
5. Connect with your Railway database credentials
6. Navigate to: `users` table
7. Find their row by email
8. Edit `username` column directly
9. Click Save

#### Option B: Using Railway CLI (Command Line)
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Select your project
4. Open a postgres shell: `railway connect -d postgres`
5. Run the SQL command (see below)

#### Option C: Using a Database Tool (Recommended)
- **DBeaver** (free, desktop app)
- **DataGrip** (paid, but powerful)
- **Adminer** (free, web-based)

Just connect to your Railway PostgreSQL and edit directly.

---

## SQL Commands for User Management

### Change a Username
```sql
UPDATE users SET username = 'NewUsername' WHERE email = 'sarah@example.com';
```

### Change an Instrument
```sql
UPDATE users SET instrument = 'Vocals' WHERE email = 'sarah@example.com';
```

### View All Users
```sql
SELECT id, email, username, instrument, created_at FROM users ORDER BY created_at;
```

### View a Specific User
```sql
SELECT * FROM users WHERE email = 'sarah@example.com';
```

### Delete a User (if they leave the band)
```sql
DELETE FROM users WHERE email = 'john@example.com';
```
**Warning**: This cascades and deletes:
- All songs they created
- All recordings they uploaded
- All availability responses
- Everything linked to them

---

## Common Scenarios

### Scenario 1: Sarah wants to change from "Sarah" to "S"
```sql
UPDATE users SET username = 'S' WHERE email = 'sarah@example.com';
```
✅ Done. Next time she logs in, she'll show as "S" on the calendar.

---

### Scenario 2: Mark switched from drums to keyboard
```sql
UPDATE users SET instrument = 'Keyboard' WHERE email = 'mark@example.com';
```
✅ Done. He'll now show as "Mark (Keyboard)" everywhere.

---

### Scenario 3: New band member joins
They sign up themselves through the app:
1. Go to Casiopony app
2. Click "Create account"
3. Enter: email, password, username, instrument
4. ✅ Automatically added to database

**You don't need to do anything!**

---

### Scenario 4: Someone leaves the band
```sql
DELETE FROM users WHERE email = 'john@example.com';
```
⚠️ This removes them completely (songs, recordings, everything).

**Better alternative** (if you want to keep their work):
```sql
-- Just mark them as inactive (future feature)
-- For now, deletion is the only way
```

---

## Database Connection Strings

Your Railway PostgreSQL connection details are in:

**Location 1**: Railway Dashboard
1. Go to railway.app
2. Select your project
3. Click PostgreSQL plugin
4. Click "Connect" tab
5. Copy the connection string

**Location 2**: Your `.env` file (if you kept it)
```
DATABASE_URL=postgresql://username:password@host:port/database
```

---

## Tools Recommendation

### For Quick One-Off Changes
Use **pgAdmin** (free web tool):
- No installation
- Just paste connection string
- Click and edit
- Done

### For Regular Management
Use **DBeaver** (free desktop app):
- Install once
- Save connection
- Fast queries
- Good for learning SQL

### If You're Technical
Use **Railway CLI** + command line:
- Fastest
- Most control
- Requires SQL knowledge

---

## Tips

✅ **Always backup your database before deleting users**
- Railway has automatic backups, but still be careful

✅ **Test commands on non-critical data first**
- Change a username to something silly to practice
- Then change it back

✅ **Keep a list of who signed up with what email**
- Write it down: Dave = dave@example.com, etc.
- Makes it easier when people ask for changes

✅ **Document changes**
- Keep a simple log of who changed what/when
- "2025-01-20: Changed Sarah's username from 'Sarah' to 'S'"

---

## Getting Help

If something goes wrong:
1. Check Railway logs
2. Look at your database backup
3. Ask Claude (me!) – I can help debug

Never delete data without being sure. When in doubt, ask first!
