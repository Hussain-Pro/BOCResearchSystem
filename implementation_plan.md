# Implementation Plan - Phase 3, 4, 5

This plan outlines the steps to complete the Electronic Research System (ERS) for Basrah Oil Company (BOC), addressing the remaining features (Phase 3), technical improvements (Phase 4), and additional ideas (Phase 5) as identified in the `ResearchAnalyze.md` report.

## User Review Required

> [!IMPORTANT]
> The scope of this plan is extremely broad. I will execute it in logical chunks, starting with critical security fixes and core business logic.
> Please confirm if you want me to proceed with the entire scope or focus on specific priorities first.

> [!WARNING]
> Implementing 2FA (TOTP) will require users to use an authenticator app. I will implement the backend logic and the setup UI.

## Phase 3: Core Functionality & Workflows

### Business Logic & Rules
- [ ] **Eligibility Enforcement:** Update `CreateSubmissionCommand` to validate employee eligibility using `EligibilityService`.
- [ ] **Strict Rules:** Implement checks for:
    - Diploma holders in Grade 2 (Technical reports only, no Grade 1 eligibility).
    - Publication/Course date validity within the current grade period.
    - Reuse of successful submissions.
- [ ] **Conflict of Interest:** Implement check against `EmployeeRelationships` during evaluator/member assignment.

### Workflows (Backend & Frontend)
- [ ] **Batch Management (Section 1):**
    - API for creating and managing batches of submissions.
    - Tracking batch status (Sent to Ministry, Received, Completed).
- [ ] **Meeting Management (Section 2):**
    - Session scheduling and attendance tracking.
    - Member assignment to specific submissions during sessions.
- [ ] **Evaluator System:**
    - Evaluator portal for grading based on 6 criteria.
    - Automatic calculation of Final Score: `(Evaluator * 0.7) + (Committee * 30)`.
- [ ] **PDF Generation:**
    - Implement `MinutesService` to generate formal meeting minutes as PDF.
    - Digital signature verification logic.

### User Interface (Frontend)
- [ ] **Authentication:** Register screen with Badge image upload and email activation.
- [ ] **Dashboard:** Role-based widgets (Submissions for Employees, Assignments for Members, Analytics for Admin).
- [ ] **Timeline:** Visual tracking of submission status.

---

## Phase 4: Security & Technical Improvements

### Security Hardening
- [ ] **Fix AuthController:** Resolve the missing `_tokenService` field bug.
- [ ] **CORS:** Restrict allowed origins in `Program.cs`.
- [ ] **2FA (TOTP):** Implement Google Authenticator integration for login.
- [ ] **Secure File Handling:** Validate PDF signatures and file types on upload.

### Infrastructure & Performance
- [ ] **Validation:** Add `FluentValidation` to all Application layer commands.
- [ ] **Global Exception Handling:** Refine the middleware to handle specific business exceptions.
- [ ] **Pagination:** Implement standard pagination for all list endpoints.
- [ ] **Caching:** Use `IMemoryCache` for roles, criteria, and system settings.

---

## Phase 5: Advanced Features

- [ ] **Internal Messaging:** API and UI for sender/recipient messaging with threading.
- [ ] **Real-time Notifications:** Integrate `SignalR` for instant alerts (e.g., new assignment, status change).
- [ ] **Analytics Dashboard:** Visual charts for submission statistics and committee performance.

## Proposed Changes

### [Component] Backend - Security & Auth

#### [MODIFY] [AuthController.cs](file:///d:/FlutterProjects/BOCResearchSystem/Backend/BOCResearch.Api/Controllers/AuthController.cs)
- Fix `_tokenService` injection.
- Add 2FA setup and verification endpoints.

#### [MODIFY] [Program.cs](file:///d:/FlutterProjects/BOCResearchSystem/Backend/BOCResearch.Api/Program.cs)
- Configure CORS.
- Register new services (SignalR, Caching, etc.).

### [Component] Backend - Core Logic

#### [MODIFY] [CreateSubmissionCommand.cs](file:///d:/FlutterProjects/BOCResearchSystem/Backend/BOCResearch.Application/Features/Submissions/Commands/CreateSubmissionCommand.cs)
- Add comprehensive validation and eligibility checks.

#### [NEW] [BatchService.cs](file:///d:/FlutterProjects/BOCResearchSystem/Backend/BOCResearch.Infrastructure/Services/BatchService.cs)
- Logic for managing submission batches.

#### [NEW] [MinutesService.cs](file:///d:/FlutterProjects/BOCResearchSystem/Backend/BOCResearch.Infrastructure/Services/MinutesService.cs)
- PDF generation logic using iTextSharp.

### [Component] Frontend - UI Components

#### [NEW] [Register.tsx](file:///src/routes/auth/register.tsx)
- Registration with badge upload.

#### [NEW] [Dashboard.tsx](file:///src/routes/dashboard.tsx)
- Role-based dashboard.

#### [NEW] [EvaluatorPortal.tsx](file:///src/routes/evaluator/index.tsx)
- Grading interface for evaluators.

## Verification Plan

### Automated Tests
- Unit tests for `EligibilityService`.
- Integration tests for `CreateSubmission` workflow.
- API tests for Role-based authorization policies.

### Manual Verification
- Verify PDF generation layout matches requirements.
- Test 2FA flow with Google Authenticator.
- Check RTL alignment and Arabic translations on all new screens.
