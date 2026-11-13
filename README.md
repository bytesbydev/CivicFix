
# CivicFix – Civic Issue Reporting Platform

CivicFix is a web-based platform that helps citizens report local civic problems and track their progress. Users can submit issues such as potholes, damaged roads, garbage accumulation, and other public infrastructure problems with photos and location details.

The platform also provides an interactive map to explore reported issues and an admin dashboard to manage submissions.

## Features

- **User Authentication** – Secure user registration and login.
- **Report Issues** – Submit civic complaints with a title, description, images, and location details.
- **Explore Map** – View reported issues on an interactive map.
- **My Reports** – Track submitted complaints and their current status.
- **Profile Management** – View and manage user profile details.
- **Admin Dashboard** – View and manage reported civic issues.
- **Image Upload** – Attach photos as evidence when reporting an issue.

## Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development and build tool |
| JavaScript | Application logic |
| Tailwind CSS | Styling |
| Supabase | Backend services and authentication |
| PostgreSQL | Database |
| Vercel | Deployment |

## Project Structure

```text
CivicFix/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── package.json
└── vite.config.js
```

*The structure may vary depending on the latest project changes.*

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Bytesbydev/CivicFix.git
```

### 2. Navigate to the Project

```bash
cd CivicFix
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholder values with your Supabase project credentials.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## Supabase Setup

CivicFix uses Supabase for authentication, database operations, and image storage.

To run the project, configure:

- A Supabase project.
- Required PostgreSQL tables.
- Authentication settings.
- Storage bucket for issue images.
- Appropriate Row Level Security (RLS) policies.

## Deployment

The frontend is deployed using Vercel.

To deploy your own version:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the required environment variables.
4. Deploy the application.

## Future Improvements

- Real-time issue status updates.
- Notifications when report status changes.
- Advanced issue filtering and search.
- Improved admin analytics.
- Support for more civic departments.

## Author

**Bytesbydev**

Frontend Developer | Cloud & AI Enthusiast

GitHub: [Bytesbydev](https://github.com/Bytesbydev)

---

If you find this project useful, consider giving the repository a star.
