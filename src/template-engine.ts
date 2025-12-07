
type Primitive = string | number | boolean | null | undefined;
type NestedObject = { [key: string]: Primitive | NestedObject };
type TemplateData = Record<string, Primitive | NestedObject>;

/**
 * Opções de configuração do parser
 */
export interface ParseOptions {
  /** Se true, mantém placeholders inválidos; se false, remove (padrão: false) */
  keepInvalid?: boolean;
  /** Padrão de regex customizado para placeholders (padrão: /\{([^}]+)\}/g) */
  pattern?: RegExp;
  /** Função customizada para formatar valores antes de inserir */
  formatter?: (value: any, path: string) => string;
  /** Prefixo/sufixo para placeholders inválidos quando keepInvalid = true */
  invalidFormat?: { prefix?: string; suffix?: string };
}

/**
 * Resultado da validação de template
 */
export interface ValidationResult {
  isValid: boolean;
  invalid: string[];
  valid: string[];
  missing: string[];
}

/**
 * Motor de templates - classe principal
 */
export class TemplateEngine {
  private defaultOptions: Required<ParseOptions>;

  constructor(options: ParseOptions = {}) {
    this.defaultOptions = {
      keepInvalid: false,
      pattern: /\{([^}]+)\}/g,
      formatter: (value: any) => String(value),
      invalidFormat: { prefix: '', suffix: '' },
      ...options,
    };
  }

  /**
   * Substitui placeholders por valores reais
   */
  parse(template: string, data: TemplateData, options?: ParseOptions): string {
    const opts = { ...this.defaultOptions, ...options };
    const pattern = new RegExp(opts.pattern.source, opts.pattern.flags);

    return template.replace(pattern, (match, path) => {
      const trimmedPath = path.trim();
      const value = this.getValue(data, trimmedPath);

      if (value !== undefined && value !== null) {
        return opts.formatter(value, trimmedPath);
      }

      if (opts.keepInvalid) {
        const { prefix = '', suffix = '' } = opts.invalidFormat;
        return `${prefix}${match}${suffix}`;
      }

      return '';
    });
  }

  /**
   * Valida template e retorna informações detalhadas
   */
  validate(template: string, data: TemplateData): ValidationResult {
    const placeholders = this.extractPlaceholders(template);
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const placeholder of placeholders) {
      const value = this.getValue(data, placeholder);
      if (value !== undefined && value !== null) {
        valid.push(placeholder);
      } else {
        invalid.push(placeholder);
      }
    }

    return {
      isValid: invalid.length === 0,
      invalid,
      valid,
      missing: invalid,
    };
  }

  /**
   * Extrai todos os placeholders de um template
   */
  extractPlaceholders(template: string): string[] {
    const pattern = new RegExp(this.defaultOptions.pattern.source, this.defaultOptions.pattern.flags);
    const matches = template.match(pattern) || [];
    return [...new Set(matches.map(match => match.slice(1, -1).trim()))];
  }

  /**
   * Obtém valor aninhado usando notação de ponto
   */
  private getValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Cria uma versão parcial dos dados para preview
   */
  createPreview(template: string, data: Partial<TemplateData>): string {
    return this.parse(template, data as TemplateData, { keepInvalid: true });
  }
}

/**
 * Funções auxiliares para uso rápido (sem instanciar classe)
 */
export function parseTemplate(
  template: string,
  data: TemplateData,
  keepInvalid: boolean = false
): string {
  const engine = new TemplateEngine({ keepInvalid });
  return engine.parse(template, data);
}

export function validateTemplate(template: string, data: TemplateData): ValidationResult {
  const engine = new TemplateEngine();
  return engine.validate(template, data);
}

export function extractPlaceholders(template: string): string[] {
  const engine = new TemplateEngine();
  return engine.extractPlaceholders(template);
}

/**
 * Helper para criar formatters customizados
 */
export const formatters = {
  /** Formata números com separador de milhares */
  number: (value: any) => {
    const num = Number(value);
    return isNaN(num) ? String(value) : num.toLocaleString('pt-BR');
  },

  /** Formata datas */
  date: (value: any) => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('pt-BR');
  },

  /** Capitaliza primeira letra */
  capitalize: (value: any) => {
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /** Uppercase */
  upper: (value: any) => String(value).toUpperCase(),

  /** Lowercase */
  lower: (value: any) => String(value).toLowerCase(),

  /** Trunca texto */
  truncate: (maxLength: number) => (value: any) => {
    const str = String(value);
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  },
};

/**
 * Gerenciador de templates pré-definidos
 */
export class TemplateManager {
  private templates = new Map<string, string>();
  private engine: TemplateEngine;

  constructor(engine?: TemplateEngine) {
    this.engine = engine || new TemplateEngine();
  }

  register(id: string, template: string): this {
    this.templates.set(id, template);
    return this;
  }

  unregister(id: string): boolean {
    return this.templates.delete(id);
  }

  render(id: string, data: TemplateData, options?: ParseOptions): string {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template '${id}' não encontrado`);
    }
    return this.engine.parse(template, data, options);
  }

  validate(id: string, data: TemplateData): ValidationResult {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template '${id}' não encontrado`);
    }
    return this.engine.validate(template, data);
  }

  has(id: string): boolean {
    return this.templates.has(id);
  }

  list(): string[] {
    return Array.from(this.templates.keys());
  }

  getTemplate(id: string): string | undefined {
    return this.templates.get(id);
  }

  clear(): void {
    this.templates.clear();
  }
}