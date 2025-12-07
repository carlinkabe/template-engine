# Kabé Template Engine

Sistema modular e flexível de templates para TypeScript, permitindo substituição dinâmica de placeholders com suporte a objetos aninhados, validação e formatação customizada.

## Instalação

```bash
npm install kabe-template-engine
# ou
yarn add kabe-template-engine
```

## Uso Rápido

```typescript
import { parseTemplate } from './kabe-template-engine';

const message = parseTemplate(
  'Olá {user.name}, bem-vindo ao {server.name}!',
  { 
    user: { name: 'João' }, 
    server: { name: 'Discord BR' } 
  }
);
// → "Olá João, bem-vindo ao Discord BR!"
```

## Features

- ✅ Substituição de placeholders com notação de ponto (`{user.name}`)
- ✅ Validação de templates antes do uso
- ✅ Formatação customizada de valores
- ✅ Gerenciamento de múltiplos templates
- ✅ Modo preview para dados parciais
- ✅ Sintaxe de placeholder configurável
- ✅ Formatters prontos (números, datas, texto)
- ✅ Type-safe com TypeScript
- ✅ Zero dependências

## API Reference

### Funções Helper

#### `parseTemplate(template, data, keepInvalid?)`

Substitui placeholders em uma string por valores reais.

**Parâmetros:**
- `template: string` - String contendo placeholders no formato `{key}` ou `{object.key}`
- `data: TemplateData` - Objeto com os valores para substituição
- `keepInvalid?: boolean` - Se `true`, mantém placeholders inválidos; se `false`, remove (padrão: `false`)

**Retorno:** `string`

**Exemplo:**
```typescript
parseTemplate('Olá {name}!', { name: 'Maria' });
// → "Olá Maria!"

parseTemplate('Olá {name}, {age} anos', { name: 'João' });
// → "Olá João,  anos"

parseTemplate('Olá {name}, {age} anos', { name: 'João' }, true);
// → "Olá João, {age} anos"
```

#### `validateTemplate(template, data)`

Valida se todos os placeholders podem ser resolvidos com os dados fornecidos.

**Parâmetros:**
- `template: string` - String do template
- `data: TemplateData` - Dados para validação

**Retorno:** `ValidationResult`

```typescript
interface ValidationResult {
  isValid: boolean;
  invalid: string[];
  valid: string[];
  missing: string[];
}
```

**Exemplo:**
```typescript
const result = validateTemplate(
  '{user.name} - {user.email}',
  { user: { name: 'João' } }
);

console.log(result);
// {
//   isValid: false,
//   invalid: ['user.email'],
//   valid: ['user.name'],
//   missing: ['user.email']
// }
```

#### `extractPlaceholders(template)`

Extrai todos os placeholders únicos de um template.

**Parâmetros:**
- `template: string` - String do template

**Retorno:** `string[]`

**Exemplo:**
```typescript
extractPlaceholders('Olá {name}, você tem {age} anos e mora em {city}');
// → ['name', 'age', 'city']
```

### Classe `TemplateEngine`

Motor principal do sistema, permite configuração avançada.

#### Constructor

```typescript
new TemplateEngine(options?: ParseOptions)
```

**Opções:**
```typescript
interface ParseOptions {
  keepInvalid?: boolean;
  pattern?: RegExp;
  formatter?: (value: any, path: string) => string;
  invalidFormat?: { prefix?: string; suffix?: string };
}
```

#### Métodos

##### `parse(template, data, options?)`

Renderiza um template com os dados fornecidos.

```typescript
const engine = new TemplateEngine();
engine.parse('Olá {name}!', { name: 'Ana' });
```

##### `validate(template, data)`

Valida um template.

```typescript
const result = engine.validate('{user.name}', { user: {} });
```

##### `extractPlaceholders(template)`

Extrai placeholders de um template.

```typescript
const placeholders = engine.extractPlaceholders('{a} e {b}');
```

##### `createPreview(template, data)`

Cria um preview mantendo placeholders não preenchidos.

```typescript
const preview = engine.createPreview(
  'Nome: {user.name} | Email: {user.email}',
  { user: { name: 'João' } }
);
// → "Nome: João | Email: {user.email}"
```

### Classe `TemplateManager`

Gerencia múltiplos templates com cache.

#### Constructor

```typescript
new TemplateManager(engine?: TemplateEngine)
```

#### Métodos

##### `register(id, template)`

Registra um novo template.

```typescript
manager.register('welcome', 'Bem-vindo {user.name}!');
```

##### `render(id, data, options?)`

Renderiza um template registrado.

```typescript
manager.render('welcome', { user: { name: 'Maria' } });
```

##### `validate(id, data)`

Valida um template registrado.

```typescript
const result = manager.validate('welcome', data);
```

##### `has(id)`

Verifica se um template existe.

```typescript
if (manager.has('welcome')) {
  // ...
}
```

##### `list()`

Lista todos os IDs de templates registrados.

```typescript
const ids = manager.list(); // ['welcome', 'goodbye', ...]
```

##### `getTemplate(id)`

Retorna o template original.

```typescript
const template = manager.getTemplate('welcome');
```

##### `unregister(id)`

Remove um template.

```typescript
manager.unregister('welcome');
```

##### `clear()`

Remove todos os templates.

```typescript
manager.clear();
```

### Formatters

Funções prontas para formatação de valores.

```typescript
import { formatters } from './kabe-template-engine';
```

#### `formatters.number(value)`

Formata números com separador de milhares (pt-BR).

```typescript
formatters.number(1500000); // → "1.500.000"
```

#### `formatters.date(value)`

Formata datas no padrão brasileiro.

```typescript
formatters.date('2024-01-15'); // → "15/01/2024"
```

#### `formatters.capitalize(value)`

Capitaliza a primeira letra.

```typescript
formatters.capitalize('joão silva'); // → "João silva"
```

#### `formatters.upper(value)`

Converte para maiúsculas.

```typescript
formatters.upper('hello'); // → "HELLO"
```

#### `formatters.lower(value)`

Converte para minúsculas.

```typescript
formatters.lower('HELLO'); // → "hello"
```

#### `formatters.truncate(maxLength)`

Trunca texto com reticências.

```typescript
formatters.truncate(10)('Texto muito longo');
// → "Texto muit..."
```

## Exemplos Avançados

### Formatação Automática

```typescript
const engine = new TemplateEngine({
  formatter: (value, path) => {
    if (path.includes('count') || path.includes('members')) {
      return formatters.number(value);
    }
    if (path.includes('date')) {
      return formatters.date(value);
    }
    return String(value);
  }
});

engine.parse(
  'Servidor com {guild.memberCount} membros, criado em {guild.createdDate}',
  { 
    guild: { 
      memberCount: 150000,
      createdDate: '2020-01-15'
    } 
  }
);
// → "Servidor com 150.000 membros, criado em 15/01/2020"
```

### Sintaxe Customizada

```typescript
// Usar [[variavel]] ao invés de {variavel}
const engine = new TemplateEngine({
  pattern: /\[\[([^\]]+)\]\]/g
});

engine.parse('Olá [[name]]!', { name: 'Carlos' });
// → "Olá Carlos!"
```

### Debug Mode

```typescript
const engine = new TemplateEngine({
  keepInvalid: true,
  invalidFormat: { prefix: '⚠️ ', suffix: ' ⚠️' }
});

engine.parse('{valid} e {invalid}', { valid: 'OK' });
// → "OK e ⚠️ {invalid} ⚠️"
```

### Manager com Templates Múltiplos

```typescript
const manager = new TemplateManager();

manager
  .register('welcome', '👋 Bem-vindo {member.name}!')
  .register('goodbye', '😢 {member.name} saiu')
  .register('levelup', '⬆️ Level {member.level}!');

const data = {
  member: { name: 'João', level: 5 }
};

manager.render('welcome', data);  // → "👋 Bem-vindo João!"
manager.render('levelup', data);  // → "⬆️ Level 5!"
```

### Validação de Input do Usuário

```typescript
function saveUserTemplate(userInput: string) {
  const exampleData = {
    member: { name: 'test', id: '123' },
    guild: { name: 'test', members: 100 }
  };

  const validation = validateTemplate(userInput, exampleData);

  if (!validation.isValid) {
    throw new Error(
      `Placeholders inválidos: ${validation.invalid.join(', ')}\n` +
      `Disponíveis: member.name, member.id, guild.name, guild.members`
    );
  }

  // Salvar no banco de dados...
}
```

## Tipos TypeScript

```typescript
type Primitive = string | number | boolean | null | undefined;
type NestedObject = { [key: string]: Primitive | NestedObject };
type TemplateData = Record<string, Primitive | NestedObject>;

interface ParseOptions {
  keepInvalid?: boolean;
  pattern?: RegExp;
  formatter?: (value: any, path: string) => string;
  invalidFormat?: { prefix?: string; suffix?: string };
}

interface ValidationResult {
  isValid: boolean;
  invalid: string[];
  valid: string[];
  missing: string[];
}
```

## Casos de Uso

### Bot Discord

```typescript
class WelcomeSystem {
  private engine = new TemplateEngine();

  async onMemberJoin(member: GuildMember) {
    const template = await this.getTemplate(member.guild.id);
    
    const message = this.engine.parse(template, {
      member: {
        name: member.user.username,
        mention: member.toString(),
      },
      guild: {
        name: member.guild.name,
        members: member.guild.memberCount,
      }
    });

    await channel.send(message);
  }
}
```

### Sistema de Notificações

```typescript
const notifications = new TemplateManager();

notifications
  .register('order-confirmed', 'Pedido #{order.id} confirmado!')
  .register('order-shipped', 'Pedido #{order.id} enviado para {order.address}')
  .register('order-delivered', 'Pedido #{order.id} entregue!');

// Enviar notificação
const msg = notifications.render('order-shipped', {
  order: { id: '12345', address: 'Rua A, 123' }
});
```

### Emails Dinâmicos

```typescript
const engine = new TemplateEngine({
  formatter: formatters.capitalize
});

const emailBody = engine.parse(emailTemplate, {
  user: { name: 'joão silva', email: 'joao@example.com' },
  product: { name: 'Produto X', price: 99.90 }
});
```

## Performance

- Parsing de templates é O(n) onde n é o tamanho da string
- Acesso a valores aninhados é O(d) onde d é a profundidade
- Cache de regex patterns para melhor performance
- Zero alocações desnecessárias

## Limitações

- Placeholders devem usar apenas letras, números, pontos e underscore
- Não suporta expressões ou lógica dentro dos placeholders
- Profundidade máxima de objetos aninhados depende da stack do JavaScript

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Licença

MIT

## Autor

Seu Nome - [@seutwitter](https://twitter.com/seutwitter)

## Agradecimentos

- Inspirado por sistemas de templates como Handlebars e Mustache
- Construído para ser simples, rápido e type-safe