#!/bin/bash

# Script de sauvegarde automatique pour le projet InEvent
# Usage: ./create_backup.sh [description_optionnelle]

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Création d'une sauvegarde du projet InEvent...${NC}"

# Générer un timestamp unique
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_${TIMESTAMP}"
BACKUP_DIR="backups/${BACKUP_NAME}"
DESCRIPTION="$1"

echo -e "${YELLOW}📅 Timestamp: ${TIMESTAMP}${NC}"

# Créer le répertoire de sauvegarde
mkdir -p "${BACKUP_DIR}"

echo -e "${BLUE}📁 Création du répertoire: ${BACKUP_DIR}${NC}"

# Copier les fichiers et dossiers importants
echo -e "${BLUE}📋 Copie des fichiers source...${NC}"
cp -r src/ "${BACKUP_DIR}/" 2>/dev/null
cp -r prisma/ "${BACKUP_DIR}/" 2>/dev/null
cp -r public/ "${BACKUP_DIR}/" 2>/dev/null
cp -r scripts/ "${BACKUP_DIR}/" 2>/dev/null || true
cp -r docs/ "${BACKUP_DIR}/" 2>/dev/null || true

echo -e "${BLUE}⚙️  Copie des fichiers de configuration...${NC}"
cp package.json package-lock.json tsconfig.json next.config.js tailwind.config.js components.json eslint.config.mjs postcss.config.js README.md .gitignore "${BACKUP_DIR}/" 2>/dev/null

echo -e "${BLUE}📄 Copie des fichiers additionnels...${NC}"
cp *.sql *.md *.js *.ts *.txt "${BACKUP_DIR}/" 2>/dev/null || true

# Créer le fichier d'information de sauvegarde
echo -e "${BLUE}📝 Création du fichier d'information...${NC}"
cat > "${BACKUP_DIR}/BACKUP_INFO.md" << EOF
# Sauvegarde du Projet InEvent - $(date '+%Y-%m-%d %H:%M:%S')

## Informations de la sauvegarde

**Date de création** : $(date '+%Y-%m-%d à %H:%M:%S')  
**Nom de la sauvegarde** : ${BACKUP_NAME}  
**Description** : ${DESCRIPTION:-"Sauvegarde automatique"}  

## État du projet

### Derniers commits Git
\`\`\`
$(git log --oneline -5 2>/dev/null || echo "Git non disponible")
\`\`\`

### Statut Git
\`\`\`
$(git status --porcelain 2>/dev/null || echo "Git non disponible")
\`\`\`

### Versions des dépendances principales
\`\`\`json
$(grep -E '"(next|react|typescript|prisma|tailwindcss)"' package.json 2>/dev/null || echo "package.json non trouvé")
\`\`\`

### Contenu de la sauvegarde
- \`src/\` - Code source de l'application
- \`prisma/\` - Schéma et configuration de base de données  
- \`public/\` - Assets statiques
- \`scripts/\` - Scripts utilitaires
- \`docs/\` - Documentation
- Fichiers de configuration (package.json, tsconfig.json, etc.)

### Instructions de restauration

1. **Extraire la sauvegarde**
   \`\`\`bash
   tar -xzf ${BACKUP_NAME}.tar.gz
   cd ${BACKUP_NAME}
   \`\`\`

2. **Installer les dépendances**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configurer l'environnement**
   \`\`\`bash
   # Copier et éditer le fichier d'environnement
   cp .env.local.example .env.local
   # Éditer .env.local avec vos variables
   \`\`\`

4. **Base de données**
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

5. **Lancer l'application**
   \`\`\`bash
   npm run dev
   \`\`\`

---

**Sauvegarde créée automatiquement avec create_backup.sh**
EOF

# Créer l'archive compressée
echo -e "${BLUE}🗜️  Compression de la sauvegarde...${NC}"
tar -czf "backups/${BACKUP_NAME}.tar.gz" -C backups/ "${BACKUP_NAME}/"

# Vérifier la taille
ARCHIVE_SIZE=$(du -sh "backups/${BACKUP_NAME}.tar.gz" | cut -f1)
FOLDER_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)

echo -e "${GREEN}✅ Sauvegarde créée avec succès !${NC}"
echo -e "${YELLOW}📊 Statistiques :${NC}"
echo -e "   📁 Dossier: ${FOLDER_SIZE}"
echo -e "   📦 Archive: ${ARCHIVE_SIZE}"
echo -e "   📍 Emplacement: backups/${BACKUP_NAME}.tar.gz"

# Mettre à jour l'index des sauvegardes
echo -e "${BLUE}📚 Mise à jour de l'index des sauvegardes...${NC}"
if [ -f "backups/BACKUP_INDEX.md" ]; then
    # Ajouter la nouvelle sauvegarde à l'index existant
    sed -i.bak "s/## Sauvegardes Disponibles/## Sauvegardes Disponibles\n\n### 📦 **${BACKUP_NAME}** - $(date '+%d %B %Y, %H:%M:%S')\n**Taille** : ${ARCHIVE_SIZE} (compressé)\n**Description** : ${DESCRIPTION:-"Sauvegarde automatique"}\n**État** : ✅ Sauvegarde automatique/" "backups/BACKUP_INDEX.md"
fi

echo -e "${GREEN}🎉 Sauvegarde terminée !${NC}"
echo -e "${BLUE}💡 Pour restaurer cette sauvegarde :${NC}"
echo -e "   tar -xzf backups/${BACKUP_NAME}.tar.gz"

exit 0 