/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'

const toolkitLoggers: {
    main: Logger | undefined
    channel: Logger | undefined
    debugConsole: Logger | undefined
} = { main: undefined, channel: undefined, debugConsole: undefined }

export interface Logger {
    debug(message: string, ...meta: any[]): number
    debug(error: Error, ...meta: any[]): number
    verbose(message: string, ...meta: any[]): number
    verbose(error: Error, ...meta: any[]): number
    info(message: string, ...meta: any[]): number
    info(error: Error, ...meta: any[]): number
    warn(message: string, ...meta: any[]): number
    warn(error: Error, ...meta: any[]): number
    error(message: string, ...meta: any[]): number
    error(error: Error, ...meta: any[]): number
    log(logLevel: LogLevel, message: string, ...meta: any[]): number
    log(logLevel: LogLevel, error: Error, ...meta: any[]): number
    setLogLevel(logLevel: LogLevel): void
    /** Returns true if the given log level is being logged.  */
    logLevelEnabled(logLevel: LogLevel): boolean
    getLogById(logID: number, file: vscode.Uri): string | undefined
    /** HACK: Enables logging to vscode Debug Console. */
    enableDebugConsole(): void
}

/**
 * Log levels ordered for comparison.
 *
 * See https://github.com/winstonjs/winston#logging-levels :
 * > RFC5424: severity of levels is numerically ascending from most important
 * > to least important.
 */
const logLevels = new Map<LogLevel, number>([
    ['error', 1],
    ['warn', 2],
    ['info', 3],
    ['verbose', 4],
    ['debug', 5],
])

export type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug'

export function fromVscodeLogLevel(logLevel: vscode.LogLevel): LogLevel {
    if (!vscode.LogLevel) {
        // vscode version <= 1.73
        return 'info'
    }

    switch (logLevel) {
        case vscode.LogLevel.Trace:
        case vscode.LogLevel.Debug:
            return 'debug'
        case vscode.LogLevel.Info:
            return 'info'
        case vscode.LogLevel.Warning:
            return 'warn'
        case vscode.LogLevel.Error:
        case vscode.LogLevel.Off:
        default:
            return 'error'
    }
}

/**
 * Compares log levels.
 *
 * @returns
 * - Zero if the log levels are equal
 * - Negative if `l1` is less than `l2`
 * - Positive if `l1` is greater than `l2`
 */
export function compareLogLevel(l1: LogLevel, l2: LogLevel): number {
    return logLevels.get(l1)! - logLevels.get(l2)!
}

/**
 * Gets the logger if it has been initialized
 * the logger is of `'main'` or `undefined`: Main logger; default impl: logs to log file and log output channel
 */
export function getLogger(): Logger {
    const logger = toolkitLoggers['main']
    if (!logger) {
        return new ConsoleLogger()
    }

    return logger
}

export function getDebugConsoleLogger(): Logger {
    return toolkitLoggers['debugConsole'] ?? new ConsoleLogger()
}

export class NullLogger implements Logger {
    public setLogLevel(logLevel: LogLevel) {}
    public logLevelEnabled(logLevel: LogLevel): boolean {
        return false
    }
    public log(logLevel: LogLevel, message: string | Error, ...meta: any[]): number {
        return 0
    }
    public debug(message: string | Error, ...meta: any[]): number {
        return 0
    }
    public verbose(message: string | Error, ...meta: any[]): number {
        return 0
    }
    public info(message: string | Error, ...meta: any[]): number {
        return 0
    }
    public warn(message: string | Error, ...meta: any[]): number {
        return 0
    }
    public error(message: string | Error, ...meta: any[]): number {
        return 0
    }
    public getLogById(logID: number, file: vscode.Uri): string | undefined {
        return undefined
    }
    public enableDebugConsole(): void {}
}

/**
 * Fallback used if {@link getLogger()} is requested before logging is fully initialized.
 */
export class ConsoleLogger implements Logger {
    public setLogLevel(logLevel: LogLevel) {}
    public logLevelEnabled(logLevel: LogLevel): boolean {
        return false
    }
    public log(logLevel: LogLevel, message: string | Error, ...meta: any[]): number {
        switch (logLevel) {
            case 'error':
                this.error(message, ...meta)
                return 0
            case 'warn':
                this.warn(message, ...meta)
                return 0
            case 'verbose':
                this.verbose(message, ...meta)
                return 0
            case 'debug':
                this.debug(message, ...meta)
                return 0
            case 'info':
            default:
                this.info(message, ...meta)
                return 0
        }
    }
    public debug(message: string | Error, ...meta: any[]): number {
        // eslint-disable-next-line aws-toolkits/no-console-log
        console.debug(message, ...meta)
        return 0
    }
    public verbose(message: string | Error, ...meta: any[]): number {
        // eslint-disable-next-line aws-toolkits/no-console-log
        console.debug(message, ...meta)
        return 0
    }
    public info(message: string | Error, ...meta: any[]): number {
        // eslint-disable-next-line aws-toolkits/no-console-log
        console.info(message, ...meta)
        return 0
    }
    public warn(message: string | Error, ...meta: any[]): number {
        // eslint-disable-next-line aws-toolkits/no-console-log
        console.warn(message, ...meta)
        return 0
    }
    /** Note: In nodejs this prints to `stderr` (see {@link Console.error}). */
    public error(message: string | Error, ...meta: any[]): number {
        // eslint-disable-next-line aws-toolkits/no-console-log
        console.error(message, ...meta)
        return 0
    }
    public getLogById(logID: number, file: vscode.Uri): string | undefined {
        return undefined
    }
    public enableDebugConsole(): void {}
}

export function getNullLogger(type?: 'debugConsole' | 'main'): Logger {
    return new NullLogger()
}
/**
 * Sets (or clears) the logger that is accessible to code.
 * The Extension is expected to call this only once per log type.
 * Tests should call this to set up a logger prior to executing code that accesses a logger.
 */
export function setLogger(logger: Logger | undefined, type?: 'debugConsole' | 'main') {
    toolkitLoggers[type ?? 'main'] = logger
}
