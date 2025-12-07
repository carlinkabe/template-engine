type Primitive = string | number | boolean | null | undefined;
type NestedObject = {
    [key: string]: Primitive | NestedObject;
};
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
    invalidFormat?: {
        prefix?: string;
        suffix?: string;
    };
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
export declare class TemplateEngine {
    private defaultOptions;
    constructor(options?: ParseOptions);
    /**
     * Substitui placeholders por valores reais
     */
    parse(template: string, data: TemplateData, options?: ParseOptions): string;
    /**
     * Valida template e retorna informações detalhadas
     */
    validate(template: string, data: TemplateData): ValidationResult;
    /**
     * Extrai todos os placeholders de um template
     */
    extractPlaceholders(template: string): string[];
    /**
     * Obtém valor aninhado usando notação de ponto
     */
    private getValue;
    /**
     * Cria uma versão parcial dos dados para preview
     */
    createPreview(template: string, data: Partial<TemplateData>): string;
}
/**
 * Funções auxiliares para uso rápido (sem instanciar classe)
 */
export declare function parseTemplate(template: string, data: TemplateData, keepInvalid?: boolean): string;
export declare function validateTemplate(template: string, data: TemplateData): ValidationResult;
export declare function extractPlaceholders(template: string): string[];
/**
 * Helper para criar formatters customizados
 */
export declare const formatters: {
    /** Formata números com separador de milhares */
    number: (value: any) => string;
    /** Formata datas */
    date: (value: any) => string;
    /** Capitaliza primeira letra */
    capitalize: (value: any) => string;
    /** Uppercase */
    upper: (value: any) => string;
    /** Lowercase */
    lower: (value: any) => string;
    /** Trunca texto */
    truncate: (maxLength: number) => (value: any) => string;
};
/**
 * Gerenciador de templates pré-definidos
 */
export declare class TemplateManager {
    private templates;
    private engine;
    constructor(engine?: TemplateEngine);
    register(id: string, template: string): this;
    unregister(id: string): boolean;
    render(id: string, data: TemplateData, options?: ParseOptions): string;
    validate(id: string, data: TemplateData): ValidationResult;
    has(id: string): boolean;
    list(): string[];
    getTemplate(id: string): string | undefined;
    clear(): void;
}
export {};
