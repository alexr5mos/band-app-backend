# Casiopony v1 - Release Notes

## What's Included

✅ **Song Documentation**
- Title, Genre, BPM, Key
- Chords
- Lyrics
- Structure (verse/chorus/bridge layout)
- Notes (collaboration notes)
- All fully searchable

✅ **Calendar & Rehearsal Scheduling**
- View calendar with confirmed rehearsals
- Propose rehearsal dates
- Band members mark availability (available/unavailable/maybe)
- See who's confirmed for each rehearsal
- Track all upcoming rehearsals in one place

✅ **User Authentication**
- Secure signup/login
- Each band member creates their own account
- 30-day session tokens
- Password hashing (bcrypt)

✅ **Collaboration**
- All 4 band members see the same songs
- Real-time updates to calendar
- Notes visible to everyone
- User attribution (see who created/edited what)

---

## What's Coming in v2

🎵 **Audio Uploads & Playback**
- Upload rehearsal recordings for each song
- Store multiple versions
- Stream audio from the app
- Track who uploaded when

📊 **Analytics & Insights**
- Practice frequency
- Song progress tracking
- Rehearsal statistics

📧 **Notifications**
- Email reminders for rehearsals
- Notification when band members respond to availability polls

📱 **Enhanced Mobile**
- Offline mode (view songs without internet)
- Better touch controls

🎨 **Customization**
- Upload band photo
- Custom colors/branding
- Set rehearsal location

---

## Why Audio Uploads Removed?

For v1, we removed audio upload functionality to:
1. **Simplify deployment** – fewer dependencies, faster setup
2. **Avoid storage complexity** – doesn't require WD MyCloud or paid cloud storage
3. **Keep it focused** – strong song documentation first, audio later
4. **Faster launch** – get the app live this week!

You can still:
- Document all song details (chords, lyrics, notes)
- Schedule rehearsals
- Track availability

Audio uploads will be added in v2 once you're comfortable with the core features.

---

## Setup Changes

### Simpler Deployment
- ✅ No file upload configuration needed
- ✅ No WD MyCloud network setup needed
- ✅ No Multer dependency
- ✅ Zero storage costs
- ✅ Just Railway PostgreSQL + Netlify frontend

### Environment Variables (Just These)
```
DATABASE_URL=postgresql://...   (from Railway)
JWT_SECRET=your-secret-key      (any random string)
NODE_ENV=production
```

No Multer, no file paths, no S3, no WD MyCloud configuration.

---

## Database Schema

Audio files table still exists (for future use):
```sql
audio_files (
  id, song_id, file_path, file_name, 
  file_size, uploaded_by, version_number, uploaded_at
)
```

It's ready for v2 – just not used in v1.

---

## Testing the App

1. **Sign up** as yourself (email, password, username, instrument)
2. **Create a song** (title, genre, BPM, key, chords, lyrics, structure, notes)
3. **View the calendar** (see example rehearsals)
4. **Propose a rehearsal** (pick a date)
5. **Invite your band** (share the app URL)
6. **They sign up** and immediately see everything

---

## Deployment Path (No Changes)

1. Push code to GitHub
2. Deploy backend to Railway
3. Deploy frontend to Netlify
4. Share URL with band
5. Everyone signs up
6. Done!

See `DEPLOY_STEP_BY_STEP.md` for full walkthrough.

---

## Total Cost

- **Railway**: Free tier (PostgreSQL included)
- **Netlify**: Free tier
- **Total**: $0/month

If you want to upgrade storage later: ~$5-10/month

---

## Next Steps

1. Deploy v1 (this week!)
2. Use it with your band for 2-4 weeks
3. Get feedback on what works/what's missing
4. Plan v2 features based on actual usage
5. Add audio uploads in v2

---

## Questions Before Launch?

Review the deployment guide and let me know if anything is unclear!

Ready to deploy? 🚀
