# Band App Backend

A collaborative band documentation API built with Express and PostgreSQL.

## Features

- 🎵 Song management (create, edit, delete)
- 🎼 Lyrics, chords, and structure notation
- 🔊 Audio file uploads with version tracking
- 👥 Multi-user collaboration
- 🔐 JWT authentication

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Set up database tables
npm run migrate

# Start dev server
npm run dev
```

The API runs on `http://localhost:3000`

### Deploy to Railway

1. **Create Railway account** – https://railway.app (free)
2. **Connect your GitHub repo** to Railway
3. **Add PostgreSQL plugin** – Railway auto-provisions this
4. **Set environment variables** in Railway dashboard:
   - `JWT_SECRET` = something random (e.g., `your-secret-key-12345`)
   - `NODE_ENV` = `production`
5. **Deploy** – Railway auto-deploys on every push

That's it! Your API is live.

## API Endpoints

### Auth

```
POST   /api/auth/signup       { email, password, username, instrument }
POST   /api/auth/login        { email, password }
```

### Songs

```
GET    /api/songs             List all songs
GET    /api/songs/:id         Get song with details & audio
POST   /api/songs             Create song (auth required)
PUT    /api/songs/:id         Update song metadata (auth required)
PUT    /api/songs/:id/details Update lyrics/chords/structure (auth required)
DELETE /api/songs/:id         Delete song (auth required)
```

### Audio

```
POST   /api/upload/audio/:songId  Upload audio file (auth required)
GET    /api/upload/song/:songId   Get audio files for a song
```

## Example Usage

### Sign up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"drummer@band.com","password":"secret","username":"Dave","instrument":"drums"}'
```

### Create a song
```bash
curl -X POST http://localhost:3000/api/songs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Stardust","genre":"indie","bpm":120,"key":"G"}'
```

### Upload audio
```bash
curl -X POST http://localhost:3000/api/upload/audio/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@rehearsal.mp3"
```

## Database Schema

**users** – band members with email, password, instrument
**songs** – song metadata (title, BPM, key, genre)
**song_details** – lyrics, chords, structure, notes
**audio_files** – uploaded rehearsal recordings with version tracking
**comments** – optional, for collaboration notes

## Notes

- Audio files are stored on disk (Railway's ephemeral storage). For persistent storage, use S3 or similar.
- JWT tokens expire after 30 days
- Max file size: 200MB per upload
- Allowed audio types: MP3, WAV, M4A, AAC

## License

MIT
