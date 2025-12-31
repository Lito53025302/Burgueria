/**
 * Sistema de Logging Profissional - App Entregador
 * 
 * Este módulo fornece funções de logging que:
 * - Só exibem logs em ambiente de desenvolvimento
 * - Formatam mensagens de forma consistente
 * - Preparam o código para integração futura com serviços de monitoramento (Sentry, etc)
 * 
 * Uso:
 * import { logger } from '@/utils/logger';
 * 
 * logger.info('Entrega aceita', { orderId: '123' });
 * logger.error('Erro ao atualizar localização', error);
 * logger.warn('GPS desabilitado');
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
    [key: string]: any;
}

class Logger {
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = import.meta.env.DEV;
    }

    /**
     * Formata a mensagem de log com timestamp e contexto
     */
    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString();
        const emoji = this.getEmoji(level);
        return `${emoji} [${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    /**
     * Retorna emoji apropriado para cada nível de log
     */
    private getEmoji(level: LogLevel): string {
        const emojis = {
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            debug: '🔍'
        };
        return emojis[level];
    }

    /**
     * Log de informação - apenas em desenvolvimento
     */
    info(message: string, data?: LogData): void {
        if (this.isDevelopment) {
            console.log(this.formatMessage('info', message), data || '');
        }
    }

    /**
     * Log de aviso - apenas em desenvolvimento
     */
    warn(message: string, data?: LogData): void {
        if (this.isDevelopment) {
            console.warn(this.formatMessage('warn', message), data || '');
        }
    }

    /**
     * Log de erro - sempre exibido (importante para debug em produção)
     * Em produção, deve ser enviado para serviço de monitoramento
     */
    error(message: string, error?: Error | any, data?: LogData): void {
        const formattedMessage = this.formatMessage('error', message);

        console.error(formattedMessage, {
            error: error?.message || error,
            stack: error?.stack,
            ...data
        });

        // TODO: Integrar com Sentry ou outro serviço de monitoramento
        // if (!this.isDevelopment) {
        //   Sentry.captureException(error, { extra: { message, ...data } });
        // }
    }

    /**
     * Log de debug - apenas em desenvolvimento
     */
    debug(message: string, data?: LogData): void {
        if (this.isDevelopment) {
            console.debug(this.formatMessage('debug', message), data || '');
        }
    }

    /**
     * Log de performance - mede tempo de execução
     */
    time(label: string): void {
        if (this.isDevelopment) {
            console.time(`⏱️ ${label}`);
        }
    }

    /**
     * Finaliza medição de performance
     */
    timeEnd(label: string): void {
        if (this.isDevelopment) {
            console.timeEnd(`⏱️ ${label}`);
        }
    }

    /**
     * Agrupa logs relacionados
     */
    group(label: string): void {
        if (this.isDevelopment) {
            console.group(`📦 ${label}`);
        }
    }

    /**
     * Finaliza grupo de logs
     */
    groupEnd(): void {
        if (this.isDevelopment) {
            console.groupEnd();
        }
    }

    /**
     * Log de tabela - útil para arrays de objetos
     */
    table(data: any[]): void {
        if (this.isDevelopment) {
            console.table(data);
        }
    }
}

// Exportar instância única do logger
export const logger = new Logger();

// Exportar também funções individuais para conveniência
export const { info, warn, error, debug, time, timeEnd, group, groupEnd, table } = logger;
