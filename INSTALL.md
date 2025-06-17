# Onidolus Installation Guide

## Quick Setup (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/onidolus.git
cd onidolus
```

2. Make the setup script executable:
```bash
chmod +x scripts/setup-db.sh
```

3. Run the setup script:
```bash
sudo ./scripts/setup-db.sh
```

4. Start the application:
```bash
npm install
npm run build
npm start
```

That's it! The script will:
- Install MySQL if not present
- Create a database and user
- Set up your environment variables
- Run all necessary migrations

## Manual Setup (Advanced)

If you prefer to set things up manually or the script doesn't work for your setup:

1. Install MySQL:
```bash
sudo apt update
sudo apt install mysql-server
```

2. Create database and user:
```bash
sudo mysql
```

```sql
CREATE DATABASE onidolus;
CREATE USER 'onidolus'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON onidolus.* TO 'onidolus'@'localhost';
FLUSH PRIVILEGES;
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update the DATABASE_URL in `.env`:
```
DATABASE_URL="mysql://onidolus:your_password@localhost:3306/onidolus"
```

5. Run migrations:
```bash
npx prisma generate
npx prisma migrate deploy
```

6. Start the application:
```bash
npm install
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. "Can't reach database server"
   - Make sure MySQL is running: `sudo systemctl status mysql`
   - Check credentials in `.env` file
   - Try connecting manually: `mysql -u onidolus -p`

2. "Prisma migration failed"
   - Make sure database exists: `mysql -e "SHOW DATABASES;"`
   - Check user permissions: `mysql -e "SHOW GRANTS FOR 'onidolus'@'localhost';"`
   - Try resetting migrations: `npx prisma migrate reset --force`

3. "Connection refused"
   - Check MySQL is running on port 3306: `sudo netstat -tlnp | grep mysql`
   - Verify firewall settings: `sudo ufw status`

### Getting Help

If you're still having issues:

1. Check the logs:
```bash
sudo journalctl -u mysql
npm run dev # Check application logs
```

2. Contact support with:
   - Your error message
   - MySQL version: `mysql --version`
   - Node.js version: `node --version`
   - Operating system details: `lsb_release -a` 