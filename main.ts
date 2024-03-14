// Standard Library Modules
import { parseArgs } from 'https://deno.land/std@0.220.0/cli/parse_args.ts';
import { existsSync } from 'https://deno.land/std@0.220.0/fs/exists.ts';
import { parse as parseJSONC } from 'https://deno.land/std@0.220.0/jsonc/mod.ts';

// Third-Party Modules
import home_dir from 'https://deno.land/x/dir@1.5.2/home_dir/mod.ts';
import { Octokit } from 'https://esm.sh/octokit@3.1.2?dts';

// Local Modules
import { debug_log, debug_heading } from './debug_logging.ts';
import { validateConfig, Config } from './validateConfig.ts';

if (import.meta.main) {
  // Get cli arguments
  const args = parseArgs(Deno.args);

  debug_heading('CLI Args');
  debug_log(args, true);

  // Get operating system specifc home directory
  const homeDirectory = home_dir();

  let config: Config = {};
  let configLocation: string;

  // Check for --config flag, otherwise use default location
  if (typeof args.config === 'string') {
    configLocation = args.config;
  } else {
    configLocation = homeDirectory + '/.boilerdump.jsonc';
  }

  debug_heading('Config Location');
  debug_log(configLocation, true);

  // Check if config file exists at provided location, then read and validate
  if (existsSync(configLocation)) {
    // Read config file
    const configFileContents = parseJSONC(
      Deno.readTextFileSync(configLocation)
    ) as unknown as Config;

    // Validate config file
    const validatedConfig = validateConfig(configFileContents);

    // validateConfig() will return null if invalid
    if (validatedConfig !== null) {
      config = validatedConfig;
    } else {
      console.error(
        'Warning: Invalid Config\n' +
          'Possible Issues:\n' +
          '  - Missing GitHub API Token\n' +
          '  - Entries with invalid types under "gist"\n' +
          'Make sure the JSON Schema is included and that your editor can detect schema errors.\n' +
          'Check the README.md for more details.'
      );
    }
  }

  // Check if a API token was provided via the --token flag
  if (typeof args.token === 'string') {
    config = {
      ...config,
      github_api_token: args.token,
    };
  }

  debug_heading('Config');
  debug_log(config, true);

  // Exit program if no API token provided
  if (typeof config.github_api_token !== 'string') {
    console.error(
      'Error: No GitHub API Token Provided\n' +
        'Be sure to include a GitHub API Token in either your config\n' +
        'or with the --token flag.\n' +
        'Example: boilerdump --token=YOUR_TOKEN GIST_ID'
    );
    Deno.exit(1);
  }

  // This will be our selected gist to download
  let gist_id = '';

  // if no non-flag args are passed, exit program
  if (args._.length === 0) {
    console.error('Error: Missing a gist id or alias');
    Deno.exit(1);
  } else {
    gist_id = String(args._[0]);
  }

  debug_heading('Gist ID');
  debug_log(gist_id);

  // Check if selected gist matches an alias in user config
  if (config.gist !== undefined) {
    for (let i = 0; i < config.gist.length; i++) {
      if (config.gist[i].name === gist_id) {
        gist_id = String(config.gist[i].id);
        break;
      }
    }
  }

  debug_log(gist_id, true);

  const octokit = new Octokit({
    auth: config.github_api_token,
  });

  // Lets finally download our selected gist
  const fetchGist = await octokit.request('GET /gists/{gist_id}', {
    gist_id: gist_id,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  debug_heading('Current Working Directory');
  debug_log(Deno.cwd(), true);

  // 1. Get current directory
  // 2. Read directory files
  // 3. Convert from iterable to array
  // 4. Create new array from name property of old array
  const cwdFiles = Array.from(Deno.readDirSync(Deno.cwd())).map((a) => a.name);

  debug_heading('Current Directory Files');
  debug_log(cwdFiles, true);

  const gistFiles = fetchGist.data.files;

  debug_heading('Gist Files');
  debug_log(Object.keys(gistFiles as object), true);

  let postRunMessage = '';

  // Time to write our files
  for (const file in gistFiles) {
    debug_log(gistFiles[file]?.filename);

    // .boilerdump.md is a special file that gets printed to the terminal
    if (file === '.boilerdump.md') {
      postRunMessage = String(gistFiles[file]?.content);
    } else {
      // Otherwise lets write the file to the target directory
      let fileName = String(gistFiles[file]?.filename);
      let attempt = 0;

      // If a file conflicts, add a number to the end (or increment that number)
      while (cwdFiles.includes(fileName)) {
        fileName = String(gistFiles[file]?.filename) + attempt;
        attempt++;

        debug_log(fileName);
      }

      Deno.writeTextFileSync(fileName, String(gistFiles[file]?.content));
    }
  }

  // Outfile contents of .boilerdump.md to the terminal
  console.log('');
  console.log(postRunMessage);
  console.log('(Any conflicting filenames have been appended with a number)');
  console.log('');
}

// All done
Deno.exit();
