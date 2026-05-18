# 🚀 Client Deploy Instructions - Symphony Training Centre

## 📥 Step 1: Clone Repository
```bash
git clone https://github.com/faiyazsumon786/Symphony-Institute-of-Technology.git
cd Symphony-Institute-of-Technology
```

## 🔧 Step 2: Environment Setup
```bash
# Set environment variables
export DATABASE_URL="postgresql://postgres:Psql18@18.118.71.248:5532/ssl_trainingcentre_db?sslmode=require"
export NODE_ENV="production"
export JWT_SECRET="super_secure_training_centre_secret"
export NEXT_PUBLIC_APP_NAME="Symphony Training Centre"
export UPLOAD_DIR="./public/uploads"
```

## 🗄️ Step 3: Database Setup
```bash
# Navigate to standalone folder
cd .next/standalone

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push
```

## 🌟 Step 4: Start Production Server
```bash
# Start the server
node server.js
```

Server will run on: `http://localhost:3000`

## 🐳 Alternative: Docker Deploy
```bash
# Build Docker image
docker build -t symphony-training-centre .

# Run container
docker run -p 3000:3000 -e DATABASE_URL="postgresql://postgres:Psql18@18.118.71.248:5532/ssl_trainingcentre_db?sslmode=require" symphony-training-centre
```

## 📁 Important Files Structure:
```
Symphony-Institute-of-Technology/
├── .next/standalone/
│   ├── server.js          # Production server
│   ├── .next/           # Build output
│   ├── node_modules/     # Dependencies
│   ├── public/           # Static files
│   └── package.json
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── build-info.md        # Detailed instructions
```

## 🔍 Verification Steps:
1. ✅ Server starts without errors
2. ✅ Database connection works
3. ✅ All pages load correctly
4. ✅ File uploads work
5. ✅ Admin panel accessible

## 🚨 Troubleshooting:
- **Database Connection Error:** Check AWS security group settings
- **Port Already in Use:** Change port or kill existing process
- **Missing Dependencies:** Run `npm install` in standalone folder
- **Permission Issues:** Check file permissions for uploads folder

## 🎯 Production URL:
Once deployed, access the application at:
- **Main Site:** `http://your-server-ip:3000`
- **Admin Panel:** `http://your-server-ip:3000/admin`

## 📞 Support:
For any deployment issues, check the `build-info.md` file or contact development team.

**Your application is ready for production! 🎉**
