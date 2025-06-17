#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Onidolus Database Setup Script${NC}"
echo "--------------------------------"

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root or with sudo${NC}"
  exit 1
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Install MySQL if not installed
if ! command_exists mysql; then
  echo -e "${BLUE}Installing MySQL...${NC}"
  apt update
  apt install -y mysql-server
  systemctl start mysql
  systemctl enable mysql
fi

# Generate random password
DB_PASSWORD=$(openssl rand -base64 12)
DB_USER="onidolus"
DB_NAME="onidolus"

# Create database and user
echo -e "${BLUE}Setting up database...${NC}"
mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Create or update .env file
echo -e "${BLUE}Updating environment variables...${NC}"
ENV_FILE="../.env"

# Backup existing .env if it exists
if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "${ENV_FILE}.backup"
fi

# Update DATABASE_URL in .env
if [ -f "$ENV_FILE" ]; then
  # If .env exists, update DATABASE_URL
  sed -i "/DATABASE_URL=/c\DATABASE_URL=\"mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME\"" "$ENV_FILE"
else
  # If .env doesn't exist, create it
  echo "DATABASE_URL=\"mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME\"" > "$ENV_FILE"
fi

# Run Prisma migrations
echo -e "${BLUE}Running database migrations...${NC}"
cd ..
npx prisma migrate reset --force
npx prisma generate
npx prisma migrate deploy

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}Your database has been configured with:${NC}"
echo "Database Name: $DB_NAME"
echo "Username: $DB_USER"
echo "Password: $DB_PASSWORD"
echo -e "${BLUE}These credentials have been saved to your .env file${NC}"
echo ""
echo -e "${RED}IMPORTANT: Make sure to save these credentials somewhere safe!${NC}" 