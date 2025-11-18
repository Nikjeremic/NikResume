# Admin Panel - Uputstvo

## Pristup Admin Panelu

Admin panel je skriven i pristupa mu se preko posebne rute:

**URL:** `http://localhost:5173/#admin`

## Login

**Password:** `admin2024`

## Pokretanje

1. **Pokreni backend server:**
   ```bash
   npm run server
   ```
   Server će raditi na portu 3001.

2. **Pokreni frontend (u drugom terminalu):**
   ```bash
   npm run dev
   ```
   Frontend će raditi na portu 5173.

3. **Pristupi admin panelu:**
   - Otvori browser i idi na: `http://localhost:5173/#admin`
   - Unesi password: `admin2024`

## Funkcionalnosti

- **Dodavanje sadržaja** - Možeš dodati novi sadržaj za bilo koju stranicu
- **Editovanje sadržaja** - Možeš editovati postojeći sadržaj
- **Brisanje sadržaja** - Možeš obrisati sadržaj
- **Organizacija po stranicama** - Sadržaj je organizovan po stranicama (Home, About, Resume, Portfolio, Blog, Contact)

## MongoDB

Podaci se čuvaju u MongoDB bazi:
- **Database:** `resume_db`
- **Collection:** `content`

## Struktura Content Item-a

```javascript
{
  page: "about",           // Stranica (home, about, resume, portfolio, blog, contact)
  section: "About Me",     // Sekcija na stranici
  content: "Text...",      // Sadržaj
  type: "text"             // Tip: "text", "list", ili "title"
}
```

## Napomena

Admin panel je skriven i nije vidljiv u normalnoj navigaciji. Pristupa mu se samo preko `#admin` rute.

