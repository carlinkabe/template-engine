"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateManager = exports.formatters = exports.TemplateEngine = void 0;
exports.parseTemplate = parseTemplate;
exports.validateTemplate = validateTemplate;
exports.extractPlaceholders = extractPlaceholders;
/**
 * Motor de templates - classe principal
 */
class TemplateEngine {
    constructor(options = {}) {
        this.defaultOptions = {
            keepInvalid: false,
            pattern: /\{([^}]+)\}/g,
            formatter: (value) => String(value),
            invalidFormat: { prefix: '', suffix: '' },
            ...options,
        };
    }
    /**
     * Substitui placeholders por valores reais
     */
    parse(template, data, options) {
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
    validate(template, data) {
        const placeholders = this.extractPlaceholders(template);
        const valid = [];
        const invalid = [];
        for (const placeholder of placeholders) {
            const value = this.getValue(data, placeholder);
            if (value !== undefined && value !== null) {
                valid.push(placeholder);
            }
            else {
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
    extractPlaceholders(template) {
        const pattern = new RegExp(this.defaultOptions.pattern.source, this.defaultOptions.pattern.flags);
        const matches = template.match(pattern) || [];
        return [...new Set(matches.map(match => match.slice(1, -1).trim()))];
    }
    /**
     * Obtém valor aninhado usando notação de ponto
     */
    getValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    /**
     * Cria uma versão parcial dos dados para preview
     */
    createPreview(template, data) {
        return this.parse(template, data, { keepInvalid: true });
    }
}
exports.TemplateEngine = TemplateEngine;
/**
 * Funções auxiliares para uso rápido (sem instanciar classe)
 */
function parseTemplate(template, data, keepInvalid = false) {
    const engine = new TemplateEngine({ keepInvalid });
    return engine.parse(template, data);
}
function validateTemplate(template, data) {
    const engine = new TemplateEngine();
    return engine.validate(template, data);
}
function extractPlaceholders(template) {
    const engine = new TemplateEngine();
    return engine.extractPlaceholders(template);
}
/**
 * Helper para criar formatters customizados
 */
exports.formatters = {
    /** Formata números com separador de milhares */
    number: (value) => {
        const num = Number(value);
        return isNaN(num) ? String(value) : num.toLocaleString('pt-BR');
    },
    /** Formata datas */
    date: (value) => {
        const date = new Date(value);
        return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('pt-BR');
    },
    /** Capitaliza primeira letra */
    capitalize: (value) => {
        const str = String(value);
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    /** Uppercase */
    upper: (value) => String(value).toUpperCase(),
    /** Lowercase */
    lower: (value) => String(value).toLowerCase(),
    /** Trunca texto */
    truncate: (maxLength) => (value) => {
        const str = String(value);
        return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
    },
};
/**
 * Gerenciador de templates pré-definidos
 */
class TemplateManager {
    constructor(engine) {
        this.templates = new Map();
        this.engine = engine || new TemplateEngine();
    }
    register(id, template) {
        this.templates.set(id, template);
        return this;
    }
    unregister(id) {
        return this.templates.delete(id);
    }
    render(id, data, options) {
        const template = this.templates.get(id);
        if (!template) {
            throw new Error(`Template '${id}' não encontrado`);
        }
        return this.engine.parse(template, data, options);
    }
    validate(id, data) {
        const template = this.templates.get(id);
        if (!template) {
            throw new Error(`Template '${id}' não encontrado`);
        }
        return this.engine.validate(template, data);
    }
    has(id) {
        return this.templates.has(id);
    }
    list() {
        return Array.from(this.templates.keys());
    }
    getTemplate(id) {
        return this.templates.get(id);
    }
    clear() {
        this.templates.clear();
    }
}
exports.TemplateManager = TemplateManager;
