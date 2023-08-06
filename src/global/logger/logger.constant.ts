export enum Tag {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN',
  DEBUG = 'DEBUG',
}
export enum Color {
  yellow = '\x1b[33m',
  red = '\x1b[31m',
  green = '\x1b[32m',
  cyan = '\x1b[36m',
  reset = '\x1b[0m',
}
export enum TagColor {
  INFO = Color.green,
  ERROR = Color.red,
  WARN = Color.yellow,
  DEBUG = Color.cyan,
}
