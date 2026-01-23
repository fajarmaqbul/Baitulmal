# Laravel Backend Setup Instructions

## 📋 Prerequisites

- PHP >= 8.2
- Composer
- MySQL >= 8.0
- Git (optional)

---

## 🚀 Installation Steps

### 1. Create Laravel Project

```bash
cd d:\
composer create-project laravel/laravel Baitulmall_API
cd Baitulmall_API
```

### 2. Configure Database

Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=baitulmall_kandri
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

Create database:
```sql
CREATE DATABASE baitulmall_kandri CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Copy Backend Templates

Copy files from `d:\Baitulmall_Dashboard\backend_templates\` to Laravel project:

```bash
# Migrations
copy backend_templates\migrations\*.php Baitulmall_API\database\migrations\

# Models
copy backend_templates\models\*.php Baitulmall_API\app\Models\

# Controllers
mkdir Baitulmall_API\app\Http\Controllers\API
copy backend_templates\controllers\*.php Baitulmall_API\app\Http\Controllers\API\

# Services
mkdir Baitulmall_API\app\Services
copy backend_templates\services\*.php Baitulmall_API\app\Services\

# Routes
copy backend_templates\api_routes.php Baitulmall_API\routes\api.php
```

### 4. Run Migrations

```bash
cd Baitulmall_API
php artisan migrate
```

Expected output:
```
Migrating: 2026_01_21_000001_create_rts_table
Migrated:  2026_01_21_000001_create_rts_table (45.23ms)
... (all 7 migrations)
```

### 5. Enable CORS for React Frontend

Install CORS package (already included in Laravel 11):
```bash
# No action needed - Laravel 11 has built-in CORS
```

Edit `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5174'], // React dev server
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### 6. Seed Initial Data (Optional)

Create seeder for RT data:
```bash
php artisan make:seeder RTSeeder
```

Edit `database/seeders/RTSeeder.php`:
```php
<?php

namespace Database\Seeders;

use App\Models\RT;
use Illuminate\Database\Seeder;

class RTSeeder extends Seeder
{
    public function run(): void
    {
        $rts = [
            ['kode' => '01', 'rw' => '01', 'ketua' => 'Ketua RT 01', 'latitude' => -7.042583, 'longitude' => 110.352222],
            ['kode' => '02', 'rw' => '01', 'ketua' => 'Ketua RT 02', 'latitude' => -7.042583, 'longitude' => 110.351222],
            ['kode' => '03', 'rw' => '01', 'ketua' => 'Ketua RT 03', 'latitude' => -7.041583, 'longitude' => 110.351222],
            ['kode' => '04', 'rw' => '01', 'ketua' => 'Ketua RT 04', 'latitude' => -7.041583, 'longitude' => 110.352222],
            ['kode' => '05', 'rw' => '01', 'ketua' => 'Ketua RT 05', 'latitude' => -7.043083, 'longitude' => 110.351722],
            ['kode' => '06', 'rw' => '01', 'ketua' => 'Ketua RT 06', 'latitude' => -7.042083, 'longitude' => 110.352722],
            ['kode' => '07', 'rw' => '01', 'ketua' => 'Ketua RT 07', 'latitude' => -7.041083, 'longitude' => 110.351722],
        ];

        foreach ($rts as $rt) {
            RT::create($rt);
        }
    }
}
```

Run seeder:
```bash
php artisan db:seed --class=RTSeeder
```

### 7. Start Development Server

```bash
php artisan serve
# Server will start at: http://127.0.0.1:8000
```

---

## 🧪 Test API Endpoints

### Using curl:

```bash
# Get all RTs
curl http://127.0.0.1:8000/api/v1/rts

# Get Asnaf statistics
curl http://127.0.0.1:8000/api/v1/asnaf/statistics?tahun=2026

# Create Asnaf
curl -X POST http://127.0.0.1:8000/api/v1/asnaf \
  -H "Content-Type: application/json" \
  -d '{
    "rt_id": 1,
    "nama": "Test Asnaf",
    "kategori": "Fakir",  
    "jumlah_jiwa": 2,
    "tahun": 2026,
    "latitude": -7.042083,
    "longitude": 110.351722
  }'

# Get map data
curl http://127.0.0.1:8000/api/v1/asnaf/map?tahun=2026
```

### Using Postman:
Import collection from: `backend_templates/postman_collection.json` (create this if needed)

---

## 🔗 Connect React Frontend

Update React to use API instead of localStorage:

### Example: Update PetaAsnaf.jsx

```javascript
// OLD (localStorage):
const { asnafData } = useBaitulmall();

// NEW (API):
import axios from 'axios';

const [asnafData, setAsnafData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/asnaf/map?tahun=2026')
        .then(response => setAsnafData(response.data.data))
        .catch(error => console.error('Error:', error))
        .finally(() => setLoading(false));
}, []);
```

---

## 📚 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/rts` | List all RTs |
| GET | `/api/v1/asnaf` | List Asnaf (filterable) |
| GET | `/api/v1/asnaf/map` | Map data for visualization |
| GET | `/api/v1/asnaf/statistics` | Statistics summary |
| POST | `/api/v1/asnaf` | Create new Asnaf |
| PUT | `/api/v1/asnaf/{id}` | Update Asnaf |
| DELETE | `/api/v1/asnaf/{id}` | Delete Asnaf (soft) |

See `api_routes.php` for complete list.

---

## ✅ Verification Checklist

- [ ] Laravel project created
- [ ] Database configured and connected
- [ ] All migrations run successfully
- [ ] Models copied and working
- [ ] Controllers copied
- [ ] Services copied
- [ ] Routes configured
- [ ] CORS enabled
- [ ] RT seeder run
- [ ] Development server running
- [ ] API endpoints respond correctly
- [ ] React app can fetch data from API

---

## 🐛 Troubleshooting

**Migration errors:**
```bash
php artisan migrate:fresh # Drops all tables and re-runs migrations
```

**Permission errors:**
```bash
chmod -R 775 storage bootstrap/cache
```

**Clear cache:**
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

**Check all routes:**
```bash
php artisan route:list --path=api
```

---

## 📝 Next Steps

1. Implement remaining controllers (RTController, MuzakiController, etc.)
2. Add authentication (Sanctum)
3. Create seeders for test data
4. Write API tests
5. Generate API documentation (OpenAPI/Swagger)
6. Migrate React app from localStorage to API
7. Deploy to production server

---

**Status:** Backend structure complete ✅  
**Ready for:** Data migration from localStorage → MySQL
