import { parseArgs } from 'https://deno.land/std@0.220.0/cli/parse_args.ts';

// Output debug messages only when --debug flag is passed
const DEBUG = parseArgs(Deno.args).debug as boolean;

/**
 * Output a single debug-only message
 * @param message - Message to be printed. Accepts same types as console.log
 * @param finalNewLine - Will print a blank line at after message if true
 */
export function debug_log(message: unknown, finalNewLine?: boolean) {
  if (DEBUG == true) {
    console.debug(message);
    if (finalNewLine) {
      console.log('');
    }
  }
}

/**
 * Output a heading for a group of debug-only messages
 * @param title Text for the heading
 */
export function debug_heading(title: string) {
  debug_log('-'.repeat(30));
  debug_log(title);
  debug_log('-'.repeat(30));
}
