#!/usr/bin/env bash
# ── Setup rápido de desenvolvimento da Orka ─────────────────────
set -e

echo "🌊 Orka — Setup de Desenvolvimento"
echo "---"

# 1. Gera FERNET_KEY se não estiver no .env
if ! grep -q "^FERNET_KEY=." .env 2>/dev/null; then
  KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
  sed -i "s/^FERNET_KEY=$/FERNET_KEY=$KEY/" .env || echo "FERNET_KEY=$KEY" >> .env
  echo "✅ FERNET_KEY gerada e salva no .env"
fi

# 2. Instalar dependências
poetry install --no-interaction

# 3. Rodar migrações
echo "→ Rodando migrações..."
alembic upgrade head
echo "✅ Banco atualizado"

echo ""
echo "Pronto! Para iniciar o servidor:"
echo "  uvicorn app.main:app --reload --port 8000"
