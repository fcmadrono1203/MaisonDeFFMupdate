# Copilot / AI Agent Instructions — Maison De FFM (backend)

Purpose: quickly orient an AI coding agent to be productive in this repository's backend.

Quick start
- Run from the `backend` folder. Install and start in development:
  - PowerShell:
    - `cd backend; npm install; npm run dev`
  - Production: `cd backend; npm run start`
- Environment variables the backend expects (create a `.env` in `backend`):
  - `MONGODB_URI` (MongoDB connection)
  - `JWT_SECRET` (used by `middleware/auth.js`)
  - `PORT` (optional)
  - `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` (used by `config/email.js` for booking emails)

Big-picture architecture
- Express API-only backend (entry: `backend/server.js`). Two main API mounts:
  - `/api/bookings` -> `backend/routes/bookingRoutes.js` -> `backend/controllers/bookingController.js`
  - `/api/services` -> intended to use `backend/routes/serviceRoutes.js` -> `backend/controllers/serviceController.js`
- Mongoose models live in `backend/models/*` (Service, Booking, Beautician, User).
- Request validation uses `Joi` in `backend/middleware/validation.js`.
- Authentication: JWT tokens verified in `backend/middleware/auth.js` (looks up `User` by id and attaches `req.user`).
- Email notifications: `backend/config/email.js` uses `nodemailer` to send booking confirmation emails.

Patterns & conventions (project-specific)
- Controllers export handler functions (e.g. `exports.createBooking = async (req, res) => { ... }`).
- Routes require controllers and attach middleware in this order: validation -> controller (auth middleware is applied where needed).
- Validation helpers are named `validateBooking` and `validateService` and return HTTP 400 with `errors` array on validation failure.
- Models use enums and conservative default values — examples:
  - Service categories: `['MASSAGE','NAILS','WAXING','THREADING']` (`models/Service.js`).
  - Booking statuses: `['pending','confirmed','cancelled','completed']` and payment status values.
- Database: seed data provided by `backend/seed.js` — run `node seed.js` inside `backend` to populate `Service` and `Beautician` collections.

Integration points & gotchas to know now
- DB: `config/db.js` connects to `process.env.MONGODB_URI` (default localhost value present). If DB fails it calls `process.exit(1)`.
- Email: `config/email.js` is responsible for outgoing booking emails. Note: the file uses `nodemailer.createTransporter(...)` which is not the standard API (`nodemailer.createTransport(...)`). Treat this as a likely bug if you edit email sending.
- Auth: middleware expects `Authorization: Bearer <token>` header. Tokens use `process.env.JWT_SECRET` fallback.
- Error handling: most code calls `errorHandler(res, status, message, error?)`. `backend/utils/errorHandler.js` is currently empty — implement a consistent helper that formats { success:false, message, details? } and sets proper status code to be used across controllers.

Files that need attention / are intentionally empty
- `backend/utils/errorHandler.js` — used widely; implement signature `errorHandler(res, statusCode, message, error?)`.
- `backend/utils/generateToken.js` — expected to create and return JWTs for users.
- `backend/models/User.js`, `backend/controllers/authController.js`, `backend/routes/serviceRoutes.js`, `backend/routes/authRoutes.js` — currently empty. Follow the project's existing patterns when implementing.

Common development tasks for agents
- Add a new controller method: create function in `controllers/`, export it, add route in `routes/`, then mount in `server.js` (or ensure the route file is already mounted).
- Use `validateBooking` / `validateService` when the route accepts POST/PUT body payloads.
- When changing auth behavior, update `middleware/auth.js` and ensure `User` model exists with at least `_id` and `role` fields.
- To seed data locally: `cd backend; node seed.js` (requires `MONGODB_URI` in `.env`).

Examples (how the code expects helpers to behave)
- Error handler usage (controllers):
  - `return errorHandler(res, 404, 'Service not found');`
  - Implement `errorHandler` so it calls `res.status(statusCode).json({ success: false, message, error: errorMessage })`.
- Auth middleware usage (routes):
  - `router.get('/', auth, bookingController.getAllBookings);` (note `auth` attaches `req.user`).

Contribute safely
- Keep changes minimal and follow existing structure: add controllers -> routes -> tests (none exist yet).
- When implementing missing files, mirror return shapes used by existing endpoints: `{ success: true, ... }` on success, and use `errorHandler(...)` on error.

Questions for maintainers (when you need clarification)
- What fields should `User` contain? (auth flows reference `User.findById(decoded.id).select('-password')`.)
- Confirm intended nodemailer usage and SMTP credentials; current `createTransporter` looks non-standard.

If anything in this file is unclear or you want examples added (e.g., sample `generateToken.js` or `errorHandler.js` implementations), tell me which helper you want implemented and I will add it.
