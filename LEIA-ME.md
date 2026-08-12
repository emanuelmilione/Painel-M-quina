# Painel KAPA — passo a passo (VS Code + GitHub + Vercel)

## 1. Instalar as ferramentas (se ainda não tiver)

No terminal do Mac:

```
brew install --cask visual-studio-code
brew install node
```

Confere se o Node instalou certo:

```
node --version
```

O `git` já vem instalado no Mac por padrão (ou o próprio sistema te oferece
pra instalar na primeira vez que você rodar um comando `git` — só aceitar).

## 2. Abrir o projeto no VS Code

Descompacta o zip que te mandei (ex: no Desktop). Depois:

- Abre o VS Code
- **File → Open Folder** → seleciona a pasta `kapa-painel`

Abre o terminal integrado do VS Code: **Terminal → New Terminal** (ou
`Ctrl+\``). Todos os comandos abaixo rodam nesse terminal, já dentro da
pasta certa.

## 3. Instalar as dependências

```
npm install
```

## 4. Pegar a chave `service_role` do Supabase

⚠️ Diferente da chave `anon` que o app Android usa — essa é privilegiada,
só pode existir no servidor da Vercel, nunca no tablet nem em nenhum lugar
público.

No painel do Supabase: **Project Settings → API → Project API keys →
`service_role`**.

## 5. Testar localmente

Copia o arquivo de exemplo e preenche com os valores reais:

```
cp .env.local.example .env.local
```

Abre `.env.local` no VS Code e substitui os dois valores. Depois:

```
npm run dev
```

Abre `http://localhost:3000` no navegador pra conferir.

## 6. Subir pro GitHub

No GitHub (github.com), cria um repositório novo — **vazio**, sem marcar
"Add a README" nem ".gitignore" (a gente já tem o nosso). Dá o nome que
quiser, ex: `kapa-painel`.

De volta ao terminal do VS Code:

```
git init
git add .
git commit -m "Painel inicial KAPA"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/kapa-painel.git
git push -u origin main
```

(troca `SEU-USUARIO` pelo seu nome de usuário do GitHub — o link certo
aparece na própria página do repositório recém-criado, num botão "Code")

Se for a primeira vez usando git nesse Mac, ele pode pedir pra você fazer
login no GitHub pela primeira vez — segue as instruções que aparecerem na
tela.

## 7. Conectar o repositório na Vercel

1. Entra em [vercel.com](https://vercel.com) → **Add New... → Project**
2. **Import Git Repository** → autoriza a Vercel a acessar sua conta do
   GitHub (só na primeira vez) → seleciona o repositório `kapa-painel`
3. A Vercel já reconhece automaticamente que é um projeto Next.js — não
   precisa mexer em nada nessa parte
4. **Antes de clicar em Deploy**, expande a seção **Environment Variables**
   e adiciona as duas: `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`, com os
   mesmos valores do seu `.env.local`
5. Clica em **Deploy**

Ele te dá um link (tipo `kapa-painel.vercel.app`) — esse é o painel
acessível de qualquer navegador ou celular.

## A partir de agora

Qualquer mudança que você (ou eu, te passando código novo) fizer no
projeto, o fluxo passa a ser:

```
git add .
git commit -m "descrição da mudança"
git push
```

E a Vercel publica sozinha, automaticamente, poucos segundos depois — sem
precisar rodar nenhum comando de deploy manual.

## Testando

Se já tiver alguma venda de teste na tabela `vendas` do Supabase (Table
Editor), ela já deve aparecer na tabela e nos resumos do painel. Se
estiver vazia, é só rodar o app na próxima vez que estiver na máquina —
cada ciclo concluído, estornado ou expirado aparece aqui automaticamente.
