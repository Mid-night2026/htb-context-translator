#!/usr/bin/env bash
# Atalho para executar o script de atualização de API
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/atualizar_api.py" "$@"
