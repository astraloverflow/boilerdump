/**
 * Individual gist entry
 */
export interface Gist {
  name: string;
  id: string;
}

/**
 * User config
 */
export interface Config {
  github_api_token?: string;
  gist?: Gist[];
}

/**
 * Validate user config file for correct types
 * @param input - Accepts plain text contents of user config file
 */
export function validateConfig(input: Config): Config | null {
  if (typeof input.github_api_token != 'string') {
    return null;
  }

  let config: Config = {
    github_api_token: input.github_api_token,
  };

  if (Array.isArray(input.gist) && input.gist.length > 0) {
    for (let i = 0; i < input.gist.length; i++) {
      const currentItem = input.gist[i];
      if (
        typeof currentItem.name !== 'string' ||
        typeof currentItem.id !== 'string'
      ) {
        return null;
      }
    }

    config = {
      ...config,
      gist: input.gist,
    };
  }

  return config;
}
