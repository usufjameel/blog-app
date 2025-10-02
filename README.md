# Technical Blog Application

A comprehensive full-stack blogging platform with advanced content creation, user management, and interactive features.

## ✨ Features

### 🔐 Authentication & User Management
- Firebase Authentication (Google & Email - password)
- User profiles and avatars
- Protected routes and role-based access

### 📝 Advanced Blog Editor
- Rich text editor with drag-and-drop sections
- Multiple content types: Text, Headers, Images, Code blocks, Two-column layouts
- Real-time preview mode
- Advanced text formatting: **bold**, *italic*, __underline__, ~~strikethrough~~
- Font size and color customization
- Multiple list styles (bullets, numbers, alphabets, roman numerals)
- Inline formatting: {{large:text}}, {{small:text}}, [links](url)
- Code syntax highlighting with Prism.js
- Image upload and management
- Draft and publish workflow

### 📊 Content Management
- Personal dashboard for managing blogs
- Draft and published blog separation
- Edit, delete, publish, and unpublish actions
- Blog statistics (views, likes, comments)
- Author verification and permissions

### 🎨 User Interface
- Responsive design with shadcn/ui components
- Modern card-based layouts
- Interactive buttons and dropdowns
- Toast notifications
- Loading states and error handling

### 📈 Engagement Features
- Like/unlike functionality
- Nested comments system
- View tracking with Redis caching
- Popular blogs section
- Blog discovery and filtering

### 🔍 Content Discovery
- Recent blogs feed
- Popular blogs ranking
- Category and tag filtering
- Author-based filtering
- Search and pagination

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **Prism.js** for code syntax highlighting
- **Zustand** for state management
- **Axios** for API calls

### Backend
- **NestJS** with TypeScript
- **PostgreSQL** database
- **Prisma ORM** for database management
- **Redis** for caching and session management
- **Firebase Admin SDK** for authentication
- **Swagger/OpenAPI** for API documentation
- **Class Validator** for input validation

### Infrastructure
- **Docker & Docker Compose** for containerization
- **File upload** handling with local storage
- **Environment-based configuration**

## 🚀 Quick Start (Docker)

1. **Clone the repository**
```bash
git clone <repository-url>
cd blog-app
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

3. **Configure Firebase credentials in `.env`**

4. **Start with Docker Compose**
```bash
docker-compose up --build
```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Swagger Documentation: http://localhost:4000/api

## 💻 Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Firebase project with Authentication enabled

### Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/blogdb

# Redis
REDIS_URL=redis://localhost:6379

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com

# Server
PORT=4000
```

## 📚 API Documentation

### Swagger UI
Access the interactive API documentation at:
- **Local**: http://localhost:4000/api
- **Production**: https://your-domain.com/api

### Key Endpoints
- `GET /blogs` - List blogs with pagination and filtering
- `POST /blogs` - Create new blog (authenticated)
- `GET /blogs/:slug` - Get blog by slug
- `PATCH /blogs/:id` - Update blog (author only)
- `DELETE /blogs/:id` - Delete blog (author only)
- `POST /blogs/:id/like` - Toggle like (authenticated)
- `GET /blogs/popular` - Get popular blogs
- `POST /uploads/image` - Upload images

### Authentication
All protected endpoints require a Bearer token:
```bash
Authorization: Bearer <firebase_id_token>
```

## 🎯 Key Features Explained

### Blog Editor
- **Drag & Drop**: Reorder sections by dragging
- **Section Types**: Text, Headers, Images, Code, Two-columns
- **Text Formatting**: Colors, sizes, styles, lists
- **Preview Mode**: Real-time preview with exact styling
- **Auto-save**: Draft functionality with manual save

### Dashboard
- **Draft Management**: Edit and publish drafts
- **Published Blogs**: View, edit, unpublish, delete
- **Statistics**: Track views, likes, comments
- **Quick Actions**: One-click edit, delete, publish

### Content Display
- **Responsive Cards**: Mobile-friendly blog cards
- **Smart Excerpts**: Auto-generated from content if no excerpt
- **Author Controls**: Edit/delete only for blog authors
- **Engagement Metrics**: Real-time stats display

## 🧪 Testing

### Backend Testing
Comprehensive Jest test suite with 100% controller coverage:

```bash
cd backend
npm test
npm run test:cov
```

**Test Coverage:**
- AuthController: 100%
- BlogsController: 100% 
- CommentsController: 100%
- UsersController: 100%
- UploadsController: 86.66%

**Test Features:**
- Mocked services and dependencies
- Firebase auth guard overrides
- Complete CRUD operation testing
- Error handling validation
- TypeScript support with Jest

## 🔄 Development Workflow

1. **Create Feature Branch**
2. **Develop with Hot Reload**
3. **Run Tests** (`npm test`)
4. **Test with Docker**
5. **Update Documentation**
6. **Submit Pull Request**

## 📦 Deployment

### Frontend (Vercel/Netlify)
1. Connect repository
2. Set environment variables
3. Deploy automatically on push

### Backend (Railway/Heroku/AWS)
1. Build Docker image
2. Set up managed PostgreSQL and Redis
3. Configure environment variables
4. Deploy container

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests if applicable
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details