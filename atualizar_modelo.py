import os

EXTENSOES_PERMITIDAS = {".py", ".json", ".js", ".env", ".md", ".txt", ".yml", ".yaml"}

SUBSTITUICOES = {
    "gemini-1.5-flash": "gemini-2.5-flash",
    "gemini-1.5-pro": "gemini-2.5-pro",
}

def atualizar_arquivos():
    diretorio_atual = os.getcwd()
    alteracoes_feitas = 0

    print(f"Varrendo o diretório: {diretorio_atual}\n")

    for raiz, _, arquivos in os.walk(diretorio_atual):
        if ".git" in raiz or "venv" in raiz or "__pycache__" in raiz:
            continue

        for arquivo in arquivos:
            ext = os.path.splitext(arquivo)[1].lower()
            if ext in EXTENSOES_PERMITIDAS:
                caminho_arquivo = os.path.join(raiz, arquivo)
                
                if arquivo == "atualizar_modelo.py":
                    continue

                try:
                    with open(caminho_arquivo, "r", encoding="utf-8") as f:
                        conteudo = f.read()

                    novo_conteudo = conteudo
                    modificado = False

                    for antigo, novo in SUBSTITUICOES.items():
                        if antigo in novo_conteudo:
                            novo_conteudo = novo_conteudo.replace(antigo, novo)
                            modificado = True

                    if modificado:
                        with open(caminho_arquivo, "w", encoding="utf-8") as f:
                            f.write(novo_conteudo)
                        print(f"[ATUALIZADO] {caminho_arquivo}")
                        alteracoes_feitas += 1

                except Exception:
                    pass

    print(f"\nConcluído! Total de arquivos modificados: {alteracoes_feitas}")

if __name__ == "__main__":
    atualizar_arquivos()
