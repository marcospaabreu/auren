# AUREN · Supera Digital

Pasta oficial do projeto: `C:\agencia\relogio`.

O site está em `site/index.html`. O 3D agora carrega por um bundle clássico local (`watch-3d.bundle.js`), permitindo abrir o HTML diretamente, sem servidor. A sintaxe do bundle foi validada; a ferramenta de navegador bloqueia URLs file://, portanto a abertura direta ainda precisa ser conferida no navegador do usuário. Para uma prévia HTTP opcional, execute na pasta oficial:

```powershell
python -m http.server 4174 --bind 127.0.0.1 --directory site
```

Depois abra http://127.0.0.1:4174.

## Conteúdo

- `site/`: HTML, CSS, JavaScript, três imagens WebP e Three.js 0.170.0 armazenado localmente, com licença MIT em `site/assets/vendor/three.LICENSE.txt`. Não depende de CDN em execução.
- `fonte/`: imagens originais produzidas pela ferramenta integrada image_gen e prompts em `prompts.json`.
- `references/`: referência CHRONOS e proposta inicial de mídia.
- `qa/`: capturas da abertura em desktop e celular.
- `brief.json`: decisões e identidade do projeto.

## Estado da implementação

Abertura WebGL com três momentos, rotação real e desmontagem/remontagem do relógio vinculadas à rolagem; manifesto; coleção; detalhes expansíveis; modal de atendimento demonstrativo. A marca é fictícia, sem pagamentos, reservas reais ou transmissão de dados. Nenhum número de WhatsApp ou destinatário de e-mail foi inventado.

A abertura agora usa um modelo 3D procedural original, com nove conjuntos: fundo, caixa, mecanismo, pontes, mostrador, aro, ponteiros, vidro e pulseira. Engrenagens e balancim se movimentam. A rolagem gira, separa e remonta as peças; os botões controlam a desmontagem e restauram a vista, e o mouse permite arrastar para girar. Não utiliza vídeo nem a imagem como geometria. É uma reconstrução original, não o modelo recuperado do ZIP. Não é necessário gerar vídeo no OpenRouter para esse efeito. A identidade visual segue a referência fornecida; as fontes atuais são Georgia e Arial locais para funcionamento offline.

## Verificação

- JavaScript passou por `node --check`.
- Conferência no navegador: três momentos da abertura, navegação, acordeão, abertura/fechamento do modal, simulação de solicitação e menu móvel.
- Desktop e viewport de 390 × 844 sem overflow horizontal; imagens carregadas; console sem erros ou avisos durante a conferência.
- Preferência de movimento reduzido implementada em CSS/JS; não foi emulada no navegador nesta conferência.
- O verificador original da skill não passa integralmente: exige WhatsApp, e-mail e frames de vídeo, ausentes nesta versão demonstrativa, e marca a imagem principal por não usar a classe `arte`, embora ela tenha máscara e mesclagem próprias. Essas limitações não foram escondidas com dados ou frames fictícios.

Não publicado. A pasta anterior no workspace permanece como cópia desatualizada; continuar as alterações na pasta oficial.

## Revisão 3D

- Código: `site/watch-3d.js` e `site/watch-3d.css`.
- Versão anterior preservada em `references/antes-3d.zip`.
- Geometria agrupada por material: 65 chamadas gráficas por quadro e 168.044 triângulos na cena verificada.
- Verificados no navegador: WebGL ativo, desmontagem pela rolagem, remontagem e reversão, controle manual, restauração e viewport móvel de 390 × 844 sem overflow horizontal.
- A cena pausa fora da abertura ou com a aba oculta. Com movimento reduzido, os movimentos contínuos são desativados; os controles continuam disponíveis. Sem WebGL, preserva a fotografia de fallback. Preferência reduzida e perda de contexto não foram simuladas nesta conferência.
- O verificador antigo exige frames de vídeo; esses requisitos foram substituídos pelo 3D real solicitado pelo usuário.
- Capturas da nova cena: `qa/3d-explodido.jpg` e `qa/3d-mobile.jpg`.

## Alterações no código 3D

Após editar site/watch-3d.js, execute python scripts/build-local.py para reconstruir site/watch-3d.bundle.js. O HTML carrega esse bundle, não o módulo-fonte. A biblioteca e a licença originais foram preservadas.


## Inicialização 3D

A preparação agora exibe um indicador, divide a construção entre quadros e pré-compila os materiais de forma assíncrona. O ambiente de reflexos usa resolução 128 e a densidade de pixels é limitada. O build inclui versões de conteúdo nos URLs de CSS e JavaScript para evitar arquivos antigos no cache. Em uma conferência local por HTTP, a cena registrou 1.122 ms até o primeiro quadro; esse tempo não inclui o download e varia por dispositivo.
`n## Estudos Rolex`nAs seções manifesto, coleção e detalhes agora contêm interpretações procedurais 3D inspiradas em Submariner, Cosmograph Daytona e Datejust. Todas permitem rotação por arraste, desmontagem/remontagem e movimento por rolagem. São estudos visuais independentes, sem fidelidade CAD ou associação oficial. Referência: https://www.rolex.com/watches/find-rolex . As cenas iniciam perto da viewport e pausam fora da tela. Testadas em desktop e em 390 px, sem erros no console ou overflow horizontal. Versão anterior em references/antes-rolex.zip.
