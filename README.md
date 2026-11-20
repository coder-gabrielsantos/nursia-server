
# Nursia — Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Cloudflare](https://img.shields.io/badge/Workers_AI-F38020?logo=cloudflare&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)

## Sobre o projeto

O **Nursia** é uma plataforma digital voltada à gestão de prontuários de enfermagem, desenvolvida no contexto do Mestrado Profissional em Telessaúde e Saúde Digital da Universidade do Estado do Rio de Janeiro (UERJ).

A plataforma tem como objetivo auxiliar os profissionais de enfermagem dos Centros de Atenção Psicossocial (CAPS) e das unidades de saúde no registro, organização e acompanhamento das informações clínicas dos pacientes, contribuindo para a digitalização dos processos assistenciais e para a continuidade do cuidado.

Este repositório contém o backend da plataforma, responsável pelo processamento das regras de negócio, gerenciamento dos prontuários, persistência das informações, autenticação, controle de acesso e integração com serviços de inteligência artificial.

## Objetivos

- Centralizar o gerenciamento dos prontuários de enfermagem.
- Disponibilizar uma API REST para integração com o frontend.
- Controlar o acesso às informações conforme os perfis profissionais.
- Estruturar e persistir as informações do processo de enfermagem.
- Automatizar a extração de dados de documentos físicos utilizando inteligência artificial.
- Contribuir para a digitalização dos serviços de saúde.

## Funcionalidades

### Autenticação e autorização

- Autenticação por credenciais de acesso.
- Controle de permissões baseado em perfis.
- Validação de credenciais por meio de middlewares.
- Gerenciamento e alteração das senhas de acesso.
- Armazenamento de senhas alteradas com hashing utilizando o algoritmo scrypt.

### Gestão de prontuários

- Criação de prontuários de enfermagem.
- Listagem e consulta de registros.
- Pesquisa de pacientes pelo nome.
- Atualização e exclusão de prontuários.
- Normalização e validação das informações recebidas.
- Persistência de dados em banco de dados MongoDB.
- Registro de datas de criação e atualização.

### Estrutura do processo de enfermagem

O modelo de dados contempla as cinco etapas do processo de enfermagem:

1. Avaliação de enfermagem.
2. Diagnóstico de enfermagem.
3. Planejamento de enfermagem.
4. Implementação de enfermagem.
5. Evolução de enfermagem.

Além disso, os prontuários permitem o armazenamento de:

- Dados de identificação e informações sociodemográficas.
- Histórico clínico e familiar.
- Diagnósticos médicos e medicamentos utilizados.
- Hábitos de vida.
- Necessidades psicossociais e psicobiológicas.
- Informações sobre alimentação, hidratação e atividade física.
- Condições de moradia.
- Pressão arterial, glicemia capilar e medidas antropométricas.

### Inteligência artificial

O backend possui integração com o Cloudflare Workers AI para extração estruturada de informações a partir de imagens de documentos de enfermagem.

A funcionalidade utiliza um modelo multimodal capaz de interpretar imagens e retornar informações em formato JSON, facilitando o preenchimento dos prontuários digitais.

## Perfis de acesso

| Funcionalidade | Enfermeiro CAPS | Enfermeiro Unidade |
| --- | :---: | :---: |
| Consultar prontuários | Sim | Sim |
| Pesquisar pacientes | Sim | Sim |
| Criar prontuários | Sim | Não |
| Editar prontuários | Sim | Não |
| Excluir prontuários | Sim | Não |
| Extrair dados com IA | Sim | Não |
| Gerenciar senhas | Sim | Não |

## Tecnologias utilizadas

| Tecnologia | Finalidade |
| --- | --- |
| Node.js | Ambiente de execução |
| JavaScript | Linguagem de programação |
| Express | Desenvolvimento da API REST |
| MongoDB | Banco de dados |
| Mongoose | Modelagem e persistência de dados |
| Helmet | Cabeçalhos HTTP de segurança |
| CORS | Controle de acesso entre origens |
| scrypt | Hashing de senhas |
| dotenv | Gerenciamento de variáveis de ambiente |
| Cloudflare Workers AI | Extração de informações com IA |
| Llama 3.2 Vision | Modelo multimodal de inteligência artificial |
| Node.js Test Runner | Testes automatizados |
| Vercel | Hospedagem e deploy |

## Arquitetura

O backend utiliza uma estrutura modular, separando rotas, modelos de dados, middlewares, serviços e funções auxiliares.

```text
Nursia Client
      |
      | HTTP / REST API
      v
Nursia Server
      |
      +---- Autenticação e autorização
      |
      +---- Gerenciamento de prontuários
      |           |
      |           v
      |        MongoDB
      |
      +---- Extração de documentos
                  |
                  v
          Cloudflare Workers AI
```

## Estrutura do projeto

```text
nursia-server/
├── src/
│   ├── middleware/
│   │   ├── checkAccess.js
│   │   └── checkRecordCreator.js
│   ├── models/
│   │   ├── AuthCredential.js
│   │   └── NursingRecord.js
│   ├── routes/
│   │   ├── ai.js
│   │   ├── auth.js
│   │   └── records.js
│   ├── services/
│   │   ├── authCredentials.js
│   │   └── workersAiExtract.js
│   ├── utils/
│   │   └── passwords.js
│   ├── app.js
│   ├── db.js
│   └── server.js
├── test/
│   └── workersAiExtract.test.js
├── .env.example
├── index.js
├── package.json
├── README.md
└── vercel.json
```

## Endpoints da API

### Status da aplicação

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/health` | Verifica a disponibilidade da API |

### Autenticação

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | `/auth/login` | Autentica o usuário |
| PUT | `/auth/passwords` | Altera as senhas de acesso |

### Prontuários

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/records` | Lista os prontuários |
| GET | `/records?q=nome` | Pesquisa pacientes pelo nome |
| GET | `/records/:id` | Consulta um prontuário específico |
| POST | `/records` | Cria um novo prontuário |
| PATCH | `/records/:id` | Atualiza um prontuário |
| DELETE | `/records/:id` | Exclui um prontuário |

### Inteligência artificial

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | `/ai/extract` | Extrai informações de uma imagem |

As rotas protegidas exigem o envio da credencial de acesso no cabeçalho HTTP `x-role-key`.

A criação, edição e exclusão de prontuários, a alteração de senhas e a extração de informações por inteligência artificial são restritas ao perfil Enfermeiro CAPS.

## Instalação e execução

### Pré-requisitos

- Node.js 22 LTS ou superior (recomendado).
- npm.
- Git.
- Instância do MongoDB local ou remota.
- Conta Cloudflare com acesso ao Workers AI, para as funcionalidades de inteligência artificial.

### 1. Clone o repositório

```bash
git clone https://github.com/coder-gabrielsantos/nursia-server.git
cd nursia-server
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` a partir do arquivo `.env.example` disponível no repositório.

```env
PORT=4000

MONGO_URI=mongodb://localhost:27017/nursia

ENFERMEIRO_CAPS_PASSWORD=
ENFERMEIRO_UNIDADE_PASSWORD=

CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_AUTH_TOKEN=
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3.2-11b-vision-instruct
```

### Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta da API. Padrão: 4000 |
| `MONGO_URI` | URI de conexão com o MongoDB |
| `ENFERMEIRO_CAPS_PASSWORD` | Senha inicial do perfil CAPS |
| `ENFERMEIRO_UNIDADE_PASSWORD` | Senha inicial do perfil Unidade |
| `CLOUDFLARE_ACCOUNT_ID` | Identificador da conta Cloudflare |
| `CLOUDFLARE_AUTH_TOKEN` | Token de acesso ao Workers AI |
| `CLOUDFLARE_AI_MODEL` | Modelo de IA utilizado (opcional) |

As credenciais e os tokens de acesso devem permanecer exclusivamente no ambiente de execução e nunca devem ser versionados no Git.

### 4. Execute o servidor

```bash
npm run dev
```

A API estará disponível em:

http://localhost:4000

Para verificar o funcionamento:

```bash
curl http://localhost:4000/health
```

Resposta esperada:

```json
{
  "ok": true
}
```

## Configuração da inteligência artificial

A extração de imagens utiliza o modelo aberto:

`@cf/meta/llama-3.2-11b-vision-instruct`

O modelo é disponibilizado por meio do Cloudflare Workers AI.

### Configuração do Workers AI

1. Crie uma conta no Cloudflare.
2. Habilite o Workers AI.
3. Crie um API Token com permissão para executar o Workers AI.
4. Configure o identificador da conta e o token nas variáveis de ambiente.
5. Antes da primeira utilização, aceite os termos de licença do modelo da Meta.

```bash
curl "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/meta/llama-3.2-11b-vision-instruct" \
  -X POST \
  -H "Authorization: Bearer $CLOUDFLARE_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"prompt":"agree"}'
```

As variáveis utilizadas no comando devem estar disponíveis no ambiente do terminal.

### Fluxo de extração

1. O frontend captura ou recebe uma imagem do documento.
2. A imagem é enviada para o endpoint `POST /ai/extract`.
3. O backend valida a credencial e a imagem recebida.
4. O documento é encaminhado ao Cloudflare Workers AI.
5. O modelo interpreta a imagem e retorna os dados estruturados.
6. As informações são disponibilizadas ao frontend para revisão profissional.
7. Após a conferência, os dados podem ser incorporados ao prontuário digital.

A franquia gratuita do Workers AI possui limites de utilização. Quando a cota é excedida, novas extrações podem ficar temporariamente indisponíveis.

## Testes automatizados

O projeto utiliza o executor nativo de testes do Node.js.

```bash
npm test
```

Os testes contemplam a integração com o serviço de inteligência artificial, incluindo:

- Validação das credenciais obrigatórias.
- Envio das imagens para o Workers AI.
- Processamento das respostas estruturadas.
- Interpretação de respostas JSON serializadas.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor em modo de desenvolvimento |
| `npm start` | Inicia o servidor |
| `npm test` | Executa os testes automatizados |

## Deploy

O projeto possui configuração para execução em ambiente serverless na Vercel.

Para realizar o deploy:

1. Importe o repositório na Vercel.
2. Configure as variáveis de ambiente necessárias.
3. Utilize uma instância MongoDB acessível pelo ambiente de hospedagem.
4. Realize o deploy da aplicação.
5. Configure o endereço da API no frontend.

As origens autorizadas para comunicação com a API são configuradas em `src/app.js`.

## Segurança e privacidade

O Nursia manipula informações sensíveis relacionadas à saúde dos pacientes. Por esse motivo, sua implementação e utilização devem observar os princípios de confidencialidade, privacidade, integridade e proteção de dados pessoais.

Entre os mecanismos implementados estão:

- Controle de acesso por perfil.
- Validação das credenciais de acesso.
- Restrição de operações de escrita.
- Hashing de senhas alteradas utilizando scrypt.
- Configuração de cabeçalhos HTTP com Helmet.
- Controle de origens permitidas por meio de CORS.
- Gerenciamento de credenciais por variáveis de ambiente.

A utilização em ambientes assistenciais deve observar as disposições aplicáveis da Lei Geral de Proteção de Dados (LGPD), as normas institucionais e os requisitos éticos relacionados ao tratamento de informações de saúde.

O processamento de documentos clínicos por serviços externos de inteligência artificial deve ser submetido à avaliação de privacidade, segurança e governança de dados da instituição responsável.

Os dados extraídos por inteligência artificial devem ser revisados e validados por um profissional de enfermagem antes de serem incorporados ao prontuário.

A plataforma atua como ferramenta de apoio ao processo de enfermagem e não substitui a avaliação clínica ou a autonomia profissional.

## Contexto acadêmico

- **Instituição:** Universidade do Estado do Rio de Janeiro (UERJ).
- **Programa:** Mestrado Profissional em Telessaúde e Saúde Digital.
- **Área de aplicação:** Enfermagem, saúde mental e saúde digital.

## Repositório relacionado

- [Nursia Client — Frontend](https://github.com/coder-gabrielsantos/nursia-client)

## Créditos

- **Concepção, requisitos clínicos e coordenação:** Rafael Rocha de Melo (Mestrado Profissional em Telessaúde e Saúde Digital, UERJ).
- **Desenvolvimento técnico (backend e frontend):** [Gabriel Santos](https://github.com/coder-gabrielsantos).

---

**Nursia** — Tecnologia a serviço da enfermagem e da continuidade do cuidado.
