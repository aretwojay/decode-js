#!/bin/bash
# Déploiement / rollback de la stack Imprint.
# Usage : ./deploy.sh [ref]
#   sans argument -> déploie le dernier commit de main
#   avec argument -> déploie ce commit/tag/branche précis (rollback)
set -e
cd /opt/imprint

REF=${1:-origin/main}

echo ">> Récupération des dernières références..."
git fetch origin

echo ">> Checkout de $REF..."
git checkout --force "$REF"

echo ">> Reconstruction et redémarrage de la stack..."
docker compose up -d --build

echo ">> Nettoyage des anciennes images..."
docker image prune -f

echo ">> Déployé : $(git rev-parse --short HEAD) - $(git log -1 --format=%s)"
