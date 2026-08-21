# Utils Documentation

## 1. Datetime Utils (`datetime.js`)

Timezone-aware datetime formatting (backend: Asia/Jakarta).

### Usage:

```jsx
import { formatServerDate, formatRelativeTime, toServerTimezone } from '@/utils/datetime';

// Display datetime from API
const checkInTime = formatServerDate(visit.check_in); // "21 Agu 2024 14:30"

// Relative time
const relTime = getRelativeTime(visit.check_in); // "2 jam yang lalu"

// Send datetime to API
const localDate = new Date();
const serverDate = toServerTimezone(localDate); // "2024-08-21 14:30:00"
```

### Functions:
- `formatServerDate(dateString, format)` - Format server datetime
- `formatDate(dateString)` - Date only
- `formatTime(dateString)` - Time only
- `formatCompactDatetime(dateString)` - Compact format (tables)
- `getRelativeTime(dateString)` - "2 jam yang lalu"
- `toServerTimezone(localDate)` - Convert local → server timezone
- `calculateDuration(start, end)` - Duration in minutes
- `formatDuration(minutes)` - "2 jam 30 menit"

---

## 2. Validation Utils (`validation.js`)

Centralized form validation.

### Phone Validation:

```jsx
import { validatePhone, normalizePhone } from '@/utils/validation';

const result = validatePhone('08123456789');
// { valid: true, normalized: '08123456789' }

const result2 = validatePhone('+628123456789');
// { valid: true, normalized: '08123456789' }

const result3 = validatePhone('invalid');
// { valid: false, message: 'Format nomor telepon tidak valid...' }
```

**Accepted formats:**
- `08xxxxxxxxxx` (10-13 digits)
- `+628xxxxxxxxxx`
- `628xxxxxxxxxx`
- `8xxxxxxxxxx`

### Form Validation:

```jsx
import { validateForm } from '@/utils/validation';

const data = {
  name: 'John Doe',
  phone: '08123456789',
  email: 'john@example.com',
};

const rules = {
  name: { required: true, type: 'name', label: 'Nama' },
  phone: { required: true, type: 'phone', label: 'No. HP' },
  email: { required: false, type: 'email', label: 'Email' },
};

const { valid, errors } = validateForm(data, rules);

if (!valid) {
  console.log(errors);
  // { phone: 'Format nomor telepon tidak valid...' }
}
```

### Available Validators:
- `validatePhone(phone)` - Phone validation + normalization
- `validateEmail(email)` - Email format check
- `validateName(name)` - Name length check (3-255 chars)
- `validateRequired(value, label)` - Required field check
- `validateForm(data, rules)` - Batch validation

---

## 3. Loading Components (`LoadingSpinner.jsx`)

Consistent loading UI.

### LoadingSpinner:

```jsx
import LoadingSpinner from '@/components/LoadingSpinner';

<LoadingSpinner size="md" text="Memuat data..." />

// Fullscreen
<LoadingSpinner fullscreen text="Processing..." />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `text`: Loading message
- `fullscreen`: Cover entire screen
- `className`: Additional classes

### LoadingOverlay:

```jsx
import { LoadingOverlay } from '@/components/LoadingSpinner';

<LoadingOverlay loading={isLoading}>
  <div>Your content here</div>
</LoadingOverlay>
```

### TableSkeleton:

```jsx
import { TableSkeleton } from '@/components/LoadingSpinner';

{loading ? <TableSkeleton rows={5} cols={4} /> : <Table data={data} />}
```

### CardSkeleton:

```jsx
import { CardSkeleton } from '@/components/LoadingSpinner';

{loading ? <CardSkeleton count={3} /> : <CardList items={items} />}
```

### ButtonSpinner:

```jsx
import { ButtonSpinner } from '@/components/LoadingSpinner';

<button disabled={submitting}>
  {submitting ? <ButtonSpinner /> : 'Submit'}
</button>
```

---

## Implementation Examples

### Page with Loading State:

```jsx
import { useState, useEffect } from 'react';
import LoadingSpinner, { TableSkeleton } from '@/components/LoadingSpinner';
import { formatServerDate } from '@/utils/datetime';

const VisitHistoryPage = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/visits');
        setVisits(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <TableSkeleton rows={10} cols={5} />;
  }

  return (
    <table>
      {visits.map(visit => (
        <tr key={visit.id}>
          <td>{visit.visitor.name}</td>
          <td>{formatServerDate(visit.check_in)}</td>
        </tr>
      ))}
    </table>
  );
};
```

### Form with Validation:

```jsx
import { useState } from 'react';
import { validateForm, normalizePhone } from '@/utils/validation';
import { ButtonSpinner } from '@/components/LoadingSpinner';

const VisitorForm = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const rules = {
      name: { required: true, type: 'name', label: 'Nama' },
      phone: { required: true, type: 'phone', label: 'No. HP' },
      email: { type: 'email', label: 'Email' },
    };

    const validation = validateForm(formData, rules);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        phone: normalizePhone(formData.phone),
      };
      await api.post('/visitors', payload);
      toast.success('Data berhasil disimpan');
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      />
      {errors.name && <span className="error">{errors.name}</span>}

      <input
        value={formData.phone}
        onChange={e => setFormData({ ...formData, phone: e.target.value })}
        placeholder="08123456789"
      />
      {errors.phone && <span className="error">{errors.phone}</span>}

      <button type="submit" disabled={submitting}>
        {submitting ? <ButtonSpinner /> : 'Simpan'}
      </button>
    </form>
  );
};
```

---

## Backend Validation (PHP)

```php
use App\Helpers\ValidationHelper;

// In controller
$this->validate($request, [
    'name' => 'required|string|max:255',
    'phone' => ['required', ValidationHelper::phoneRule()],
    'email' => 'nullable|email',
]);

// Or manual validation
$phoneValidation = ValidationHelper::validatePhone($request->phone);
if (!$phoneValidation['valid']) {
    return response()->json([
        'success' => false,
        'message' => $phoneValidation['message'],
    ], 422);
}

// Normalize before save
$normalizedPhone = ValidationHelper::normalizePhone($request->phone);
Visitor::create([
    'phone' => $normalizedPhone,
    // ...
]);
```
