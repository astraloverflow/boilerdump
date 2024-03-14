# Boilerdump

[![Discord][Discord]](https://discord.gg/WpyQ8GZ5hs)

Boilerdump is a simple tool to download config files and other boilerplate from a Github gist. Just put all of your frequently used config files in a GitHub Gist, then pass the gist id to the boilerdump cli.

## Requirements

- [Deno](https://deno.com/)

## Install

For Linux and Mac:

```sh
deno install -n=boilerdump --allow-env=HOME --allow-read=./,$HOME/.boilerdump.jsonc --allow-write=./ --allow-net=api.github.com https://esm.sh/gh/astraloverflow/boilerdump@0.1.0/main.ts
```

For Windows _(currently untested)_:

```sh
deno install -n=boilerdump --allow-env=USERPROFILE --allow-read=./,$USERPROFILE/.boilerdump.jsonc --allow-write=./ --allow-net=api.github.com https://esm.sh/gh/astraloverflow/boilerdump@0.1.0/main.ts
```

If you want the added safety of confirming each file you write to your target directory, remove `--allow-write=./` from the above install command. Doing so will make Deno ask for permission tp write each file.

If you want to run Boilerdump without installing it, just swap `deno install` for `deno run`

## Config

You will need to setup a boilerdump config file. Boilerdump will automatically look in your home directory for a file named `.boilerdump.jsonc`

If for whatever reason you can't or don't want to put your boilerdump config in your home directory, you can manually specify a path to your config file.

```sh
boilerdump --config=~/.boilerdump.json
```

The boilerdump config will generally look like this, however, the only required field is the GitHub API token.

```jsonc
{
  // Boilerdump Aliases

  // JSON Schema
  "$schema": "https://esm.sh/gh/astraloverflow/boilerdump/schema.json",

  // Your GitHub API Token
  "github_api_token": "ghp_YOUR_API_TOKEN_HERE",

  // Your aliases
  "gist": [
    {
      "name": "web",
      "id": "abcdefghijklmnopqrstuvwxyz"
    }
  ]
}
```

If your editor supports JSON Schema, be sure to include the `"$schema"` property in your config file.

To generate a GitHub API token, go to your settings on GitHub, then go to "Developer Settings" -> "Personal access tokens" -> "Tokens (Classic)" -> "Generate new token (Classic)".

You will then be asked to give a name, an expiration date, and scope. For the scope section, you do not need to check any boxes, the default read permissions are all that's needed. After that, click the "Generate token" button. Then copy the token and put it in your boilerdump config.

Alternatively, you can skip the config and directly provide your API token.

```sh
boilerdump --token=YOUR_TOKEN
```

## Setting Up Your Gist

While Boilerdump will just copy all the files in a gist, there is a special file that is treated differently.

If `.boilerdump.md` exists in the gist, it will not be copied to the target directory and instead it will be outputted as text in the terminal.

It is recommended that you include a "Files" section listing all the files being copied to the target directory.

```md
## Files

- .editorconfig
- .prettierrc.cjs
```

Additionally, if any commands need to be run afterwards, you can list them in a "Install" section.

````md
## Install

```
npm i -D prettier prettier-plugin-css-order
```
````

## Command-line Usage

To copy the files from a gist into a directory, just grab the Gist ID and pass it to boilerdump.

```sh
boilerdump abcdefghijklmnopqrstuvwxyz
```

This assumes that you've given your API token either to your boilerdump config or via the `--token` flag.

If you're having trouble finding the gist ID, look at the url for the gist.

```
https://gist.github.com/USERNAME/GIST_ID
```

The gist ID is the part after the username.

### Gist Aliases

To use an alias, make sure that your boilerdump config has the alias you want to use entered under the `gist` array.

```jsonc
"gist": [
  {
    "name": "web", // Your alias name. This is what you'll pass to cli.
    "id": "abcdefghijklmnopqrstuvwxyz" // The ID for the gist.
  }
]
```

You can then pass the alias name to boilerdump.

```sh
boilerdump web
```

## Conflicts

If a file in the gist conflicts with a file in the target directory, boilerdump will add a number to the end of the conflicting gist file. So if a `.editorconfig` file already exists, the `.editorconfig` file from the gist will be saved as `.editorconfig0`.

[Discord]: https://img.shields.io/discord/1206042209825067039?style=flat&logo=discord&logoColor=white&label=discord&color=%235865f2
