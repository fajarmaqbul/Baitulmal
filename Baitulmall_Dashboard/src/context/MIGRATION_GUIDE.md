# 🚨 BaitulmallContext DEPRECATED

**Status:** DEPRECATED as of 2026-01-21  
**Reason:** Migrating to Laravel API as single source of truth

---

## ⚠️ Important Notice

`BaitulmallContext.jsx` and `useBaitulmall()` hook are **DEPRECATED** and will be removed in future versions.

### DO NOT USE for new features!

All new development should use **API services** from `src/services/`.

---

## Migration Path

### ❌ Old Way (DEPRECATED)
```jsx
import { useBaitulmall } from '../context/BaitulmallContext';

const MyComponent = () => {
    const { asnafData } = useBaitulmall(); // ⚠️ DEPRECATED
    
    return <div>{asnafData.length} asnaf</div>;
};
```

### ✅ New Way (RECOMMENDED)
```jsx
import { fetchAsnafList } from '../services/asnafApi';
import { useState, useEffect } from 'react';

const MyComponent = () => {
    const [asnafData, setAsnafData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchAsnafList({ per_page: 500, tahun: 2026 });
                setAsnafData(response.data);
            } catch (error) {
                console.error('Failed to load:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    
    if (loading) return <div>Loading...</div>;
    return <div>{asnafData.length} asnaf</div>;
};
```

---

## API Services Available

### Asnaf Data
```jsx
import {
    fetchAsnafList,      // Get paginated list
    fetchAsnafMap,       // Get map data with coordinates
    fetchAsnafStatistics,// Get statistics summary
    fetchAsnafById,      // Get single Asnaf
    createAsnaf,         // Create new Asnaf
    updateAsnaf,         // Update existing
    deleteAsnaf          // Delete (soft)
} from '../services/asnafApi';
```

### RT Data
```jsx
import {
    fetchRTs,            // Get all RTs
    fetchRTById,         // Get single RT
    fetchAsnafByRT       // Get Asnaf in specific RT
} from '../services/asnafApi';
```

---

## Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| `PetaAsnaf.jsx` | ✅ **MIGRATED** | Uses API with fallback to Context |
| `AsnafManagement.jsx` | ⏳ **PENDING** | Needs migration |
| `Dashboard.jsx` | ⏳ **PENDING** | Needs migration |
| `ZakatFitrah.jsx` | ⏳ **PENDING** | Needs migration |
| Other pages | ⏳ **PENDING** | TBD |

---

## Why This Change?

### Problems with localStorage/Context:
- ❌ No central database
- ❌ Data inconsistency across devices
- ❌ No audit trail
- ❌ Hard to share data
- ❌ No security

### Benefits of Laravel API:
- ✅ Single source of truth (MySQL database)
- ✅ Data persistence across devices
- ✅ Audit trail & user tracking
- ✅ Proper authentication & authorization
- ✅ Scalable architecture
- ✅ Production-ready

---

## Backward Compatibility

**Context is NOT removed yet** - it's kept for:
1. Legacy components not yet migrated
2. Fallback during API failures (development safety)
3. Gradual migration without breaking existing features

### Console Warnings

When using `useBaitulmall()` in development, you'll see:
```
⚠️ DEPRECATED: useBaitulmall() is deprecated. 
Please use API services from src/services/asnafApi.js instead. 
This Context will be removed in future versions.
```

This is **intentional** - it reminds developers to migrate.

---

## Timeline

- **2026-01-21:** Context marked as deprecated
- **Phase 1:** Migrate all main pages to API (in progress)
- **Phase 2:** Migrate remaining components
- **Phase 3:** Remove Context entirely (after all migrations complete)

---

## Need Help?

Check these resources:
1. **API Service:** `src/services/asnafApi.js` - All available functions
2. **Example:** `src/pages/PetaAsnaf.jsx` - Complete migration example with fallback
3. **Backend API:** `http://127.0.0.1:8000/api/v1` - Laravel endpoints

---

## Questions?

**Q: Can I still use Context?**  
A: Yes, for now. But you'll see deprecation warnings.

**Q: When will Context be removed?**  
A: After all components are migrated to API.

**Q: What if API fails?**  
A: PetaAsnaf shows fallback pattern - use Context as safety net.

**Q: Do I need to rewrite everything?**  
A: No - gradual migration. One component at a time.

---

**Last Updated:** 2026-01-21  
**Migration Champion:** Laravel API Integration Team
