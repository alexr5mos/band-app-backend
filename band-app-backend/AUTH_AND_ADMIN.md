# Authentication & Admin Management for Casiopony

## How Login Works

### User Registration Flow
1. **First time**: Someone visits the app and clicks "Create account"
2. **They enter**:
   - Email (e.g., dave@example.com)
   - Password (hashed with bcrypt before storing)
   - Username (e.g., "Dave")
   - Instrument (e.g., "Drums")
3. **Account created** in the database with `users` table
4. **JWT token** issued (valid for 30 days)
5. **They're logged in** and can access Songs & Calendar

### Each Band Member Signs Up Individually
- **No admin approval needed** – anyone can create an account
- Each person signs up with their own email/password
- They immediately have read/write access to all songs and calendar

**Example**:
- Dave signs up: dave@casiopony.com / drums
- Sarah signs up: sarah@casiopony.com / bass
- Mark signs up: mark@casiopony.com / guitar
- John signs up: john@casiopony.com / keys

All 4 see the same songs, calendar, and rehearsals.

---

## Admin Management

### Current Setup (Simple)
**There is NO special "admin" role yet.** All users have equal permissions:
- ✅ Create songs
- ✅ Edit any song
- ✅ Delete any song
- ✅ Add rehearsal dates
- ✅ Mark availability
- ✅ Upload audio

This works fine for a 4-person band where everyone trusts each other.

---

## If You Want More Control Later

### Option 1: Restrict Song Editing (Simple Addition)
Make it so **only the person who created a song** can edit it.

**Code change** (in `routes/songs.js`):
```javascript
// Before updating, check if user is the creator
const song = await pool.query('SELECT created_by FROM songs WHERE id = $1', [req.params.id]);
if (song.rows[0].created_by !== req.userId) {
  return res.status(403).json({ error: 'Only the creator can edit this song' });
}
```

---

### Option 2: Add Admin Role (More Complex)
Make yourself an admin with extra privileges:

**Add to `users` table**:
```sql
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
```

**During initial setup**, set your account as admin:
```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

**Then admins could**:
- Delete any song
- Remove users
- Reset passwords
- See activity logs

---

## Recommended: Hybrid Approach (Current Setup + Option 1)

**Best for you**: Keep it simple now, but add "creator-only editing" later if needed.

```
Each person can:
- Create songs
- Edit ONLY their own songs
- See all songs/calendar
- Propose rehearsals
- Mark availability
```

This prevents accidental overwrites while keeping it collaborative.

---

## Password Management

### Users forget their password?
**Currently**: No "forgot password" feature.

**To add** (future enhancement):
1. User clicks "Forgot password"
2. Enter email
3. Get reset link (sent via email service)
4. Set new password

**Would require**: Email service (SendGrid, Mailgun, etc.) – adds small cost.

---

## Session Management

### How long does a login last?
- **JWT tokens valid for 30 days**
- After 30 days, user must log in again
- Token stored in browser's `localStorage`
- Automatically included in all API requests

### If someone logs out?
- Token deleted from localStorage
- They're logged out immediately
- Need to log in again next time

---

## Security Notes

✅ **Passwords are hashed** (bcrypt) – never stored in plain text  
✅ **HTTPS required** in production (Netlify/Railway handle this)  
✅ **JWT tokens signed** – can't be forged  
⚠️ **All users see all data** – no per-song privacy yet  

---

## Implementation Checklist

### Current (Ready to Deploy)
- [x] Signup with email/password
- [x] Login with JWT
- [x] Tokens expire after 30 days
- [x] All users can access all songs
- [x] All users can add rehearsals

### Optional (Can Add Later)
- [ ] Creator-only song editing
- [ ] Admin role
- [ ] Password reset email
- [ ] User profile management
- [ ] Activity/audit logs

---

## Your Setup Process

### Step 1: Deploy the app (Railway + Netlify)
- See `DEPLOYMENT.md`

### Step 2: You create your account
- Go to the app
- Click "Create account"
- Sign up as: dave@example.com (or whatever)
- You're the admin now (first user created)

### Step 3: Share with your band
- Copy the Netlify URL: `https://casiopony-app.netlify.app`
- Send to Sarah, Mark, John
- They each sign up individually
- Done!

### Step 4: Everyone can immediately
- View/edit songs
- Propose rehearsals
- Mark availability
- Upload audio

---

## Managing Users After Launch

### To see who has accounts:
```sql
SELECT email, username, instrument, created_at FROM users;
```

### To delete a user (if someone leaves):
```sql
DELETE FROM users WHERE email = 'john@example.com';
-- This cascades: deletes their songs, uploads, availability, etc.
```

### To reset someone's password (temporarily):
```sql
-- They'd need to use "forgot password" feature (not yet built)
-- For now, they have to create a new account with same email
```

---

## Recommendation

**Start with the current setup** (everyone equal access). It's perfect for a 4-person band.

If you want more control later, adding "creator-only editing" is a 10-minute code change.

Full admin features (role-based access, user management UI) are overkill for a small band but can be added anytime.

**Questions?** Ask before you deploy!
