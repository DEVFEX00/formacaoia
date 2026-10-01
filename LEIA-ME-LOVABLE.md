# Publicar no Lovable (formacao-ia.fexeducacao.edu.br)

Esta pasta é o site pronto no formato que o Lovable usa (Vite). Não é um app React:
o Lovable só precisa instalar, construir (`npm run build`) e publicar.

## Caminho: Lovable ↔ GitHub

1. **Abra o projeto do Lovable que já está ligado ao domínio** `formacao-ia.fexeducacao.edu.br`
   (se o domínio ainda não estiver em nenhum projeto, crie um projeto vazio).
2. **Conecte ao GitHub**: botão **GitHub** (canto superior direito) → *Connect* → autorize →
   *Create repository*. O Lovable cria um repositório e sincroniza nos dois sentidos.
3. **Troque o conteúdo do repositório pelo desta pasta**:
   - apague tudo do repositório (menos a pasta oculta `.git`);
   - copie para lá **todo o conteúdo desta pasta** (`index.html`, `package.json`, `vite.config.js`,
     `src/`, `public/`, `.gitignore`);
   - faça commit e push para a branch principal (`main`).
   > O vídeo `public/media/vsl.mp4` tem 78 MB: o site do GitHub só aceita até 25 MB por upload no
   > navegador. Use o **GitHub Desktop** (ou `git push`), que aceita até 100 MB por arquivo.
4. O Lovable puxa o código sozinho em alguns segundos. Confira a pré-visualização.
5. **Publish** (canto superior direito) → *Update*. Se o domínio já está ligado a esse projeto,
   o link existente passa a mostrar o site novo.

## Se o domínio estiver em outro projeto
Projeto antigo → *Settings → Domains* → remova o domínio. Projeto novo → *Settings → Domains →
Connect domain* → digite `formacao-ia.fexeducacao.edu.br` e cadastre no DNS (Registro.br ou onde o
`.edu.br` é gerenciado) exatamente os registros que o Lovable mostrar. A propagação pode levar algumas horas.

## Cuidados
- **Não peça para a IA do Lovable editar este site.** Ele não é feito em React; a IA tende a reescrever
  e quebrar as animações. Mudanças de texto: `src/content.js`. Imagens e vídeo: `public/`.
- **Vídeo mais leve (opcional):** hospede a VSL no Vimeo/YouTube (não listado)/Bunny e troque em
  `src/content.js` → `vsl.media` por `{ type: 'embed', src: '<link de incorporação>' }`.
- **Link do botão "Quero conhecer a capacitação":** `src/content.js` → `cta.href`.
