#!/usr/bin/env python3
"""
Script interativo para atualizar a chave de API do Google Gemini
na extensão HTB Context Translator.
"""

import os
import sys
import json
import getpass
import re
import tempfile
import time
import urllib.request
import urllib.error

# Cores para o terminal
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

DIRETORIO_ATUAL = os.path.dirname(os.path.abspath(__file__))
CAMINHO_CONFIG = os.path.join(DIRETORIO_ATUAL, "config.js")
CAMINHO_GITIGNORE = os.path.join(DIRETORIO_ATUAL, ".gitignore")


def testar_chave(api_key: str) -> bool:
    """Verifica se a chave é válida testando na API do Gemini."""
    url = "https://generativelanguage.googleapis.com/v1beta/models"
    print(f"\n{CYAN}⏳ Validando chave junto à API do Google Gemini...{RESET}")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HTB-Translator-Setup", "x-goog-api-key": api_key})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())
            if "models" in data:
                print(f"{GREEN}✓ Chave válida e autenticada com sucesso!{RESET}")
                return True
    except urllib.error.HTTPError as e:
        detalhes = e.read().decode()
        try:
            err_json = json.loads(detalhes)
            msg = err_json.get("error", {}).get("message", str(e))
        except Exception:
            msg = str(e)
        print(f"{RED}✗ Chave rejeitada ou serviço indisponível (HTTP {e.code}).{RESET}")
        return False
    except Exception as e:
        print(f"{YELLOW}⚠ Não foi possível validar online (erro de rede: {e}).{RESET}")
        confirmar = input(f"{YELLOW}Deseja salvar mesmo assim? (s/n): {RESET}").strip().lower()
        return confirmar == "s"

    return False


def garantir_gitignore():
    """Garante que config.js está protegido no .gitignore."""
    for d in [DIRETORIO_ATUAL, os.path.dirname(DIRETORIO_ATUAL)]:
        caminho_gi = os.path.join(d, ".gitignore")
        if os.path.exists(caminho_gi):
            try:
                with open(caminho_gi, "r", encoding="utf-8") as f:
                    conteudo = f.read()
                if "config.js" not in conteudo:
                    with open(caminho_gi, "a", encoding="utf-8") as f:
                        f.write("\nconfig.js\n**/config.js\n")
            except Exception:
                pass


def atualizar_config(api_key: str):
    """Salva a chave no config.js."""
    if not re.fullmatch(r"[A-Za-z0-9_.-]{15,256}", api_key):
        raise ValueError("Formato de chave inválido.")
    garantir_gitignore()
    payload = {"GEMINI_API_KEY": api_key, "UPDATED_AT": time.time_ns() // 1_000_000}
    conteudo_js = "// Configuração local (ignorada pelo Git)\nconst CONFIG = " + json.dumps(payload, indent=2) + ";\n"
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=os.path.dirname(CAMINHO_CONFIG), prefix=".config-", delete=False) as file:
            temporary = file.name
            os.chmod(temporary, 0o600)
            file.write(conteudo_js)
            file.flush()
            os.fsync(file.fileno())
        os.replace(temporary, CAMINHO_CONFIG)
    finally:
        if temporary and os.path.exists(temporary):
            os.unlink(temporary)

    print(f"\n{GREEN}{BOLD}===================================================={RESET}")
    print(f"{GREEN}{BOLD}  ✅ Chave da API atualizada com sucesso no config.js!{RESET}")
    print(f"{GREEN}{BOLD}===================================================={RESET}")
    print(f"{CYAN}Recarregue a extensão em chrome://extensions e depois as abas do HTB. A configuração mais recente (popup ou terminal) terá prioridade.{RESET}\n")


def main():
    print(f"\n{BOLD}{CYAN}=== 🛡️ Atualizador de API - HTB Context Translator ==={RESET}\n")

    if os.path.exists(CAMINHO_CONFIG):
        print("Já existe uma configuração local (chave oculta).")

    try:
        nova_chave = getpass.getpass(f"{BOLD}🔑 Cole ou digite a sua nova chave da API do Gemini: {RESET}").strip()
    except (KeyboardInterrupt, EOFError):
        print(f"\n{YELLOW}Operação cancelada pelo usuário.{RESET}")
        sys.exit(0)

    # Remove eventuais aspas ou espaços acidentais ao colar
    nova_chave = nova_chave.strip("'\" \t\r\n")

    if not nova_chave:
        print(f"{RED}✗ Nenhuma chave fornecida. Operação abortada.{RESET}")
        sys.exit(1)

    if not re.fullmatch(r"[A-Za-z0-9_.-]{15,256}", nova_chave):
        print(f"{RED}Formato de chave inválido.{RESET}")
        sys.exit(1)

    # Testa a chave antes de salvar
    valida = testar_chave(nova_chave)
    if not valida:
        perg = input(f"{YELLOW}A validação falhou. Deseja forçar a atualização mesmo assim? (s/N): {RESET}").strip().lower()
        if perg != "s":
            print(f"{RED}Atualização cancelada.{RESET}")
            sys.exit(1)

    atualizar_config(nova_chave)


if __name__ == "__main__":
    main()
