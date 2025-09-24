#!/bin/bash

# Script de respaldo automático para ParKing

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚗 Respaldando ParKing app...${NC}"

# Agregar todos los cambios
git add -A

# Crear commit con timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Respaldo automático: $TIMESTAMP" -m "Cambios guardados automáticamente"

# Push a GitHub
git push origin main

echo -e "${GREEN}✅ Respaldo completado!${NC}"
echo "Último respaldo: $TIMESTAMP"