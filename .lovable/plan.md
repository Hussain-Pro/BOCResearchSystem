

## Add Register Page + 2FA in Profile

Mock-data only (no backend). Arabic RTL, matches existing teal/emerald design.

### 1. New Register Page — `src/routes/register.tsx`

Two-column layout mirroring login (`index.tsx`) with hero on the right and form on the left.

**Form fields** (per ERS spec, Users + Employees tables):
- الرقم الوظيفي (EmployeeID) — required
- الاسم الكامل (FullName)
- البريد الإلكتروني المؤسسي (Email) — `@boc.oil.gov.iq` validation
- اسم المستخدم (Username) — unique check vs `mockUsers`
- كلمة المرور + تأكيدها — min 8, mixed case + digit
- رمز التفعيل (ActivationCode) — 6 digits, mock-validated against a hardcoded list (e.g. `ERS-2025`)
- القسم / المسمى الوظيفي / الدرجة الوظيفية (2 or 3) / الشهادة — dropdowns
- موافقة على الشروط (checkbox)

**Validation**: zod schema, inline errors, Arabic messages, toast on submit.

**Behavior** (mock):
- On submit → show success toast "تم إرسال طلب التسجيل، بانتظار تفعيل المشرف"
- Status = pending verification (matches `IsCodeUsed` / `VerifiedByUserID` flow)
- Redirect to `/` with info banner

**Link from login page**: add "ليس لديك حساب؟ سجّل الآن" under the login button in `src/routes/index.tsx`.

### 2. Profile Page with 2FA — `src/routes/_app/profile.tsx`

New route accessible to all roles via sidebar (add entry in `AppShell.tsx` NAV).

**Sections (tabs or stacked cards):**

**أ. المعلومات الشخصية**
- Read-only: full name, employee ID, department, job grade, qualification, last grade change date
- Editable: email, phone, profile photo (mock upload)
- "حفظ التغييرات" button

**ب. الأمان**
- تغيير كلمة المرور: current / new / confirm
- جلسات الدخول الأخيرة (mock list: device, IP, time)

**ج. التحقق بخطوتين (2FA)** — main feature
- Status indicator: `<Switch>` "مفعّل / غير مفعّل" bound to `user.twoFactorEnabled`
- When toggling ON → opens `Dialog`:
  1. **Step 1**: Show mock QR code (use `qrcode.react` or simple `<svg>` placeholder) + manual secret key (e.g. `JBSWY3DPEHPK3PXP`) with copy button
  2. **Step 2**: Instructions for Google Authenticator / Microsoft Authenticator
  3. **Step 3**: 6-digit OTP input using existing `input-otp` component to verify
  4. **Step 4**: Show 8 backup recovery codes + download as .txt
  5. Confirm → toast success, persist `twoFactorEnabled=true` in auth context
- When toggling OFF → confirm dialog requiring current password + OTP, then disable

**د. التفضيلات**
- اللغة (Arabic only — disabled), الإشعارات (email/push toggles), المظهر (light/dark)

### 3. Mock Data Updates — `src/lib/mockData.ts`

Extend `MockUser` interface:
```ts
twoFactorEnabled?: boolean;
phone?: string;
avatarUrl?: string;
```
Add helper `mockActivationCodes: string[]` for register validation.

### 4. Auth Context Updates — `src/lib/auth.tsx`

Add:
- `register(data): boolean` — pushes to local mockUsers (session only)
- `updateProfile(patch: Partial<MockUser>)` — updates current user + persists to localStorage
- `enable2FA(otp: string): boolean` / `disable2FA(): void`

### 5. Sidebar / Header

- `AppShell.tsx`: add "الملف الشخصي" link in user dropdown (header) → `/profile`. No sidebar entry needed (keeps nav clean).

### Technical notes

- All routes use `createFileRoute` with the existing `_app` layout pattern
- Use existing UI components: `Dialog`, `Tabs`, `Switch`, `InputOTP`, `Button`, `Card`, `Label`, `Input`
- Zod already used elsewhere in stack — add `zod` import for validation
- For QR code: lightweight `qrcode.react` (~5kb) added as dependency
- Pure mock: no real TOTP verification — accept any 6-digit code where digits sum > 0
- Persist 2FA state in localStorage alongside the user object
- Build verified with `bun run build` after implementation

### Files

**New:**
- `src/routes/register.tsx`
- `src/routes/_app/profile.tsx`

**Modified:**
- `src/routes/index.tsx` (register link)
- `src/lib/mockData.ts` (extend MockUser, activation codes)
- `src/lib/auth.tsx` (register / updateProfile / 2FA helpers)
- `src/components/AppShell.tsx` (profile link in user dropdown)
- `package.json` (add `qrcode.react`)

