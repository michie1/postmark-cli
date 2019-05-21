import { Argv } from 'yargs'
import chalk from 'chalk'
import { prompt } from 'inquirer'

/**
 * Bootstrap commands
 * @returns yargs compatible command options
 */
export const cmd = (name: string, desc: string) => ({
  name: name,
  command: `${name} <command> [options]`,
  desc: desc,
  builder: (yargs: Argv) => yargs.commandDir(`commands/${name}`),
})

/**
 * Pluralize a string
 * @returns The proper string depending on the count
 */
export const pluralize = (count: number, singular: string, plural: string) =>
  count > 1 ? plural : singular

/**
 * Log stuff to the console
 * @returns Logging with fancy colors
 */
export const log = (text: string, settings?: LogSettings) => {
  // Errors
  if (settings && settings.error) {
    return console.error(chalk.red(text))
  }

  // Warnings
  if (settings && settings.warn) {
    return console.warn(chalk.yellow(text))
  }

  // Custom colors
  if (settings && settings.color) {
    return console.log(chalk[settings.color](text))
  }

  // Default
  return console.log(text)
}

interface LogSettings {
  error?: boolean
  warn?: boolean
  color?: 'green' | 'red' | 'blue' | 'yellow'
}

/**
 * Prompt for server or account tokens
 * @returns Promise
 */
export const serverTokenPrompt = (account: boolean) =>
  new Promise<string>((resolve, reject) => {
    const tokenType = account ? 'account' : 'server'

    prompt([
      {
        type: 'password',
        name: 'token',
        message: `Please enter your ${tokenType} token`,
        mask: '•',
      },
    ]).then((answer: { token?: string }) => {
      const { token } = answer

      if (!token) {
        log(`Invalid ${tokenType} token`, { error: true })
        process.exit(1)
        return reject()
      }

      return resolve(token)
    })
  })

/**
 * Validates the presence of a server or account token
 * @return Promise
 */
export const validateToken = (token: string, account: boolean = false) =>
  new Promise<string>(resolve => {
    // Missing token
    if (!token) {
      return serverTokenPrompt(account).then(tokenPrompt =>
        resolve(tokenPrompt)
      )
    }

    return resolve(token)
  })