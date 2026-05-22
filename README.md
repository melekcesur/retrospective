# RetroApp

Anonim sprint retrospektif aracı. Mad / Sad / Glad formatı.

## Özellikler

- **Anonim kartlar** — kim ne ekledi görünmez
- **Kartları gizle** — host açarsa kişiler sadece kendi kartlarını okuyabilir
- **Oylama** — host oylamayı açıp kapatabilir, her kişi kart başına 1 oy (geri alınabilir)
- **Timer** — 1/3/5/10 dk seçenekleri, tüm katılımcılarda senkron sayar
- **Sıralama** — tarihe veya oya göre
- **Katılım kodu** — 6 haneli kod paylaş, ekip doğrudan katılır

---

## Yerel Geliştirme (5 dakika)

### 1. Bağımlılıkları yükle

```bash
cd retro-app
npm install
```

### 2. Veritabanını başlat

```bash
npm run db:init
```

SQLite dosyası (`local.db`) otomatik oluşur, `.env` gerekmez.

### 3. Uygulamayı başlat

```bash
npm run dev
```

`http://localhost:3000` adresini aç.

---

## Üretim Deployment (Vercel + Turso)

### Adım 1 — Turso veritabanı oluştur

1. [turso.tech](https://turso.tech) → ücretsiz kayıt
2. `turso db create retro-app`
3. URL ve token al:
   ```bash
   turso db show retro-app --url
   turso db tokens create retro-app
   ```

### Adım 2 — Tabloları oluştur (tek seferlik)

```bash
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npm run db:init
```

### Adım 3 — GitHub'a push et

```bash
git init
git add .
git commit -m "init"
git remote add origin <repo-url>
git push -u origin main
```

### Adım 4 — Vercel'e bağla

1. [vercel.com/new](https://vercel.com/new) → GitHub repoyu seç → Import
2. **Environment Variables** ekle:
   - `TURSO_DATABASE_URL` → `libsql://...`
   - `TURSO_AUTH_TOKEN` → token
3. **Deploy** → URL al, ekiple paylaş ✓

---

## Nasıl Kullanılır

1. **Host**: Ana sayfada retro adı gir → "Retroyu Başlat" → 6 haneli kodu paylaş
2. **Katılımcılar**: Kodu gir → "Katıl"
3. Herkes anonim kart ekler
4. Host gerekirse kartları gizler (oylama için)
5. Host oylamayı açar → herkes oy kullanır
6. Kartları oya göre sırala → tartışmayı yürüt
