# Plataforma Escolar

Uma plataforma completa de gerenciamento escolar desenvolvida com tecnologias modernas, permitindo o gerenciamento de alunos, turmas, cursos e agendamentos.

## Tecnologias Utilizadas

### Frontend
- **React** 19 - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Linguagem tipada para maior segurança
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS utilitário para estilização
- **React Router** - Roteamento de páginas
- **Lucide React** - Ícones SVG customizáveis

### Backend
- **Go** 1.25.2 - Linguagem de programação de alto desempenho
- **Gin** - Framework web minimalista para Go
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **CORS** - Compartilhamento de recursos entre origens

OBS: existe o plano para fazer a alteração de PostgreSQL para SQLite, isso para o momento que o programa for transferido do modelo site/web para serviço executavel pelo OS do cliente.

### DevOps
- **Docker & Docker Compose** - Containerização da aplicação
- **PostgreSQL 15** - Banco de dados em container

## Pré-requisitos

Antes de começar, você precisará ter instalado:

- **Node.js** (versão 16+) e npm
- **Go** (versão 1.25.2+)
- **Docker** e **Docker Compose**
- **Git**

## Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/GuilhermeFerza/plataforma-escolar.git
cd plataforma-escolar
```

### 2. Configure o banco de dados

Inicie o container do PostgreSQL:

```bash
docker compose up -d
```

Isso irá:
- Criar e iniciar o container PostgreSQL
- Configurar o banco de dados `techadvance`
- Usar as credenciais padrão (admin/123)
- Expor a porta 5434

### 3. Configure e execute o backend

```bash
cd server
go mod download
go run main.go ou go run .
```

O servidor será iniciado em `http://localhost:8081`

### 4. Configure e execute o frontend

Em outro terminal:

```bash
cd client
npm install
npm run dev
```

A aplicação frontend estará disponível em `http://localhost:5173`

## Estrutura do Projeto

```
├── client/                          # Aplicação frontend React
│   ├── src/
│   │   ├── components/              # Componentes React reutilizáveis
│   │   │   ├── AdminRoute.tsx       # Rota protegida para admins
│   │   │   ├── ProtectedRoute.tsx   # Rota protegida para usuários autenticados
│   │   │   ├── Sidebar.tsx          # Barra lateral de navegação
│   │   │   └── NewCourseModal.tsx   # Modal para criar novos cursos
│   │   ├── pages/                   # Páginas da aplicação
│   │   │   ├── Dashboard.tsx        # Página inicial
│   │   │   ├── Alunos.tsx           # Gerenciamento de alunos
│   │   │   ├── Turmas.tsx           # Gerenciamento de turmas
│   │   │   ├── Courses.tsx          # Gerenciamento de cursos
│   │   │   ├── Agendamentos.tsx     # Gerenciamento de agendamentos
│   │   │   ├── Admin.tsx            # Painel administrativo
│   │   │   └── Login.tsx            # Página de login
│   │   ├── App.tsx                  # Componente principal
│   │   └── main.tsx                 # Ponto de entrada
│   ├── vite.config.ts               # Configuração do Vite
│   └── package.json                 # Dependências do frontend
│
├── server/                          # Aplicação backend Go
│   ├── controllers/                 # Controladores (lógica de rotas)
│   │   ├── appoitmentController.go  # Gerenciamento de agendamentos
│   │   ├── classController.go       # Gerenciamento de turmas
│   │   ├── courseController.go      # Gerenciamento de cursos
│   │   └── studentsController.go    # Gerenciamento de alunos
│   ├── models/                      # Modelos de dados
│   │   └── models.go                # Definição das estruturas
│   ├── database/                    # Configuração do banco de dados
│   │   └── database.go              # Conexão com PostgreSQL
│   ├── main.go                      # Ponto de entrada do servidor
│   └── go.mod                       # Dependências do backend
│
└── docker-compose.yml               # Configuração dos containers
```

## Autenticação

A plataforma utiliza **JWT (JSON Web Tokens)** para autenticação:

- Os tokens são gerados no login e inclusos no header `Authorization`
- Formato: `Bearer <seu_token_jwt>`
- O middleware de autenticação valida todos os endpoints protegidos
- Senhas são armazenadas com hash bcrypt para segurança

## API Endpoints

### Autenticação
- `POST /login` - Realizar login e receber token JWT
- `POST /register` - Registrar novo usuário

### Alunos
- `GET /students` - Listar todos os alunos
- `GET /students/:id` - Obter detalhes de um aluno
- `POST /students` - Criar novo aluno
- `PUT /students/:id` - Atualizar dados de um aluno
- `DELETE /students/:id` - Deletar um aluno

### Turmas
- `GET /classes` - Listar todas as turmas
- `GET /classes/:id` - Obter detalhes de uma turma
- `POST /classes` - Criar nova turma
- `PUT /classes/:id` - Atualizar uma turma
- `DELETE /classes/:id` - Deletar uma turma

### Cursos
- `GET /courses` - Listar todos os cursos
- `GET /courses/:id` - Obter detalhes de um curso
- `POST /courses` - Criar novo curso
- `PUT /courses/:id` - Atualizar um curso
- `DELETE /courses/:id` - Deletar um curso

### Agendamentos
- `GET /appointments` - Listar todos os agendamentos
- `GET /appointments/:id` - Obter detalhes de um agendamento
- `POST /appointments` - Criar novo agendamento
- `PUT /appointments/:id` - Atualizar um agendamento
- `DELETE /appointments/:id` - Deletar um agendamento

## Variáveis de Ambiente

### Backend (server)
Crie um arquivo `.env` na pasta `server/`:

```env
DATABASE_URL=postgres://admin:123@localhost:5434/techadvance
JWT_SECRET=123123
PORT=8080
```

### Frontend (client)
Crie um arquivo `.env` na pasta `client/`:

```env
VITE_API_URL=http://localhost:8080
```

## Scripts Disponíveis

### Frontend

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Gera o build para produção
npm run lint     # Executa o linter (ESLint)
npm run preview  # Visualiza o build de produção localmente
```

### Backend

```bash
go run main.go           # Executa o servidor
go build                 # Compila o binário
go mod tidy              # Sincroniza as dependências
```

## Docker

Para executar a aplicação completa com Docker:

```bash
# Inicie o banco de dados
docker-compose up -d

# Verifique se o container está rodando
docker-compose ps

# Para parar os containers
docker-compose down

# Para ver os logs
docker-compose logs -f db
```

## Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando: `docker-compose ps`
- Valide as credenciais no arquivo `.env`
- Certifique-se de que a porta 5434 não está em uso

### Erro CORS no frontend
- Verifique se o backend está rodando em `http://localhost:8081`
- Confirme que as variáveis de ambiente estão corretas

### Erro de dependências Go
```bash
cd server
go clean -modcache
go mod download
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

**Desenvolvedor**: Guilherme Ferza

Para dúvidas, sugestões ou relatórios de bugs, abra uma issue no repositório.

---

**Última atualização**: Maio de 2026
