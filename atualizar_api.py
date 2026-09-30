#!/usr/bin/env python3
"""
Script interativo para atualizar a chave de API do Google Gemini
na extensão HTB Context Translator.
"""

import os
import sys
import json
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
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    print(f"\n{CYAN}⏳ Validando chave junto à API do Google Gemini...{RESET}")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HTB-Translator-Setup"})
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
        print(f"{RED}✗ Erro na API do Gemini ({e.code}): {msg}{RESET}")
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
    garantir_gitignore()
    conteudo_js = (
        "// Configuração local da extensão (ignorado pelo Git)\n"
        "const CONFIG = {\n"
        f"  GEMINI_API_KEY: '{api_key}'\n"
        "};\n"
    )
    with open(CAMINHO_CONFIG, "w", encoding="utf-8") as f:
        f.write(conteudo_js)

    print(f"\n{GREEN}{BOLD}===================================================={RESET}")
    print(f"{GREEN}{BOLD}  ✅ Chave da API atualizada com sucesso no config.js!{RESET}")
    print(f"{GREEN}{BOLD}===================================================={RESET}")
    print(f"{CYAN}Dica: Recarregue a página do HTB Academy ou clique em recarregar na extensão para usar a nova chave.{RESET}\n")


def main():
    print(f"\n{BOLD}{CYAN}=== 🛡️ Atualizador de API - HTB Context Translator ==={RESET}\n")

    # Verifica se já existe uma chave configurada
    if os.path.exists(CAMINHO_CONFIG):
        try:
            with open(CAMINHO_CONFIG, "r", encoding="utf-8") as f:
                c = f.read()
            import re
            m = re.search(r"GEMINI_API_KEY:\s*'([^']+)'", c)
            if m and m.group(1) != "SUA_CHAVE_API_AQUI":
                chave_atual = m.group(1)
                preview = chave_atual[:8] + "..." + chave_atual[-4:]
                print(f"Chave atual configurada: {YELLOW}{preview}{RESET}\n")
        except Exception:
            pass

    try:
        nova_chave = input(f"{BOLD}🔑 Cole ou digite a sua nova chave da API do Gemini: {RESET}").strip()
    except (KeyboardInterrupt, EOFError):
        print(f"\n{YELLOW}Operação cancelada pelo usuário.{RESET}")
        sys.exit(0)

    # Remove eventuais aspas ou espaços acidentais ao colar
    nova_chave = nova_chave.strip("'\" \t\r\n")

    if not nova_chave:
        print(f"{RED}✗ Nenhuma chave fornecida. Operação abortada.{RESET}")
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
