#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import prompts from 'prompts';

const run = (cmd: string) => execSync(cmd, { stdio: 'inherit' });

(async () => {
  console.log('🧰 Welcome to CraftSkillz TypeScript Project Generator!');

  const cliArg = process.argv[2];

  const response = await prompts([
    {
      type: cliArg ? null : 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: cliArg || 'my-ts-project',
    },
    {
      type: 'select',
      name: 'template',
      message: 'Choose a template:',
      choices: [
        { title: '🟦 Node + TypeScript', value: 'node' },
        { title: '⚡ React + Vite + TypeScript', value: 'vite-react' },
        { title: '💻 TypeScript NPX Prompt', value: 'npx prompt' },
      ],
    },
  ]);

  const projectName = cliArg || response.projectName;
  const { template } = response;
  if (!projectName || !template) {
    console.log('❌ Cancelled.');
    process.exit(1);
  }

  if (fs.existsSync(projectName)) {
    console.error(
      `❌ Folder "${projectName}" already exists. Delete it or choose another name.`,
    );
    process.exit(1);
  }
  fs.mkdirSync(projectName);
  process.chdir(projectName);

  // -----------------------------
  // Template setup
  // -----------------------------
  switch (template) {
    case 'vite-react':
      configureVSCode();
      configureGitIgnore();
      generateViteReactProject();
      break;
    case 'npx prompt':
      generateNpxPromptProject(projectName);
      installEsLintAndPrettierAndVitest();
      configureTsConfigJSON();
      configureVSCode();
      configureGitIgnore();
      break;
    default:
      generateNodeTypescriptProject(projectName);
      installEsLintAndPrettierAndVitest();
      configureTsConfigJSON();
      configureVSCode();
      configureGitIgnore();
  }

  console.log('\n✅ Project setup complete!');
  console.log(`\n👉 Next steps:
  cd ${projectName}
  pnpm install
  pnpm run dev
  pnpm run test
  `);
})();

function generateViteReactProject() {
  run(`pnpm create vite@latest . --template react-ts --yes`);
}

function generateNpxPromptProject(projectName: string) {
  fs.writeFileSync(
    'package.json',
    JSON.stringify(
      {
        name: projectName,
        version: '1.0.0',
        type: 'module',
        bin: {
          projectName: './dist/index.js',
        },
        scripts: {
          build: 'tsc',
          postbuild: 'chmod +x dist/index.js',
          dev: 'tsc --watch',
          start: 'node dist/index.js',
          lint: 'eslint . --ext .ts,.tsx',
          format: 'prettier --write .',
        },
        devDependencies: {},
      },
      null,
      2,
    ),
  );

  run('pnpm add -D tsx @types/prompts');

  run('pnpm add prompts');

  // src folder
  fs.mkdirSync('src');
  fs.writeFileSync(
    'src/index.ts',
    `export function sum(a: number, b: number) {
  return a + b;
}

console.log('5+3 = ', sum(5, 3));`,
  );

  // tests folder with Vitest
  fs.mkdirSync('tests', { recursive: true });
  fs.writeFileSync(
    'tests/example.test.ts',
    `import { describe, it, expect } from 'vitest';
import { sum } from '../src/index';

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
`,
  );
  fs.writeFileSync(
    'README.md',
    `# ${projectName}

Create a new TypeScript project preconfigured with ESLint, Prettier, and VSCode settings — powered by pnpm.

## 🚀 Usage

\`\`\`bash
npx ${projectName} my-project
\`\`\`

Then open in VSCode and start coding ✨

## Test local usage

\`\`\`bash
pnpm tsx src/index.ts my-project
\`\`\`

## Publish to NPM

Do not forget to first **BUILD** then **PUBLISH**

\`\`\`bash
pnpm build
pnpm publish --access public
\`\`\`

🧩 Features

- ⚡ TypeScript setup (tsconfig.json)

- 🧹 ESLint + Prettier with recommended rules

- 🧑‍💻 VSCode settings for auto-formatting

- 📦 pnpm-based initialization

📝 License

MIT © 2025 Youssef MEDAGHRI-ALAOUI
`,
  );
}

function generateNodeTypescriptProject(projectName: string) {
  // Node + TS: package.json
  fs.writeFileSync(
    'package.json',
    JSON.stringify(
      {
        name: projectName,
        version: '1.0.0',
        type: 'module',
        scripts: {},
        devDependencies: {},
      },
      null,
      2,
    ),
  );

  // -----------------------------
  // Update package.json scripts
  // -----------------------------
  console.log('\n🧰 Updating package.json scripts...');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.scripts = Object.assign(pkg.scripts || {}, {
    build: 'tsc',
    start: 'node dist/index.js',
    dev: 'nodemon --watch src --ext ts --exec "node --loader ts-node/esm src/index.ts"',
    lint: 'eslint . --ext .ts,.tsx',
    format: 'prettier --write .',
    test: 'vitest run',
    'test:watch': 'vitest',
  });
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

  run('pnpm add -D ts-node nodemon');

  // src folder
  fs.mkdirSync('src');
  fs.writeFileSync(
    'src/index.ts',
    `export function sum(a: number, b: number) { return a + b; }\n`,
  );

  // tests folder with Vitest
  fs.mkdirSync('tests', { recursive: true });
  fs.writeFileSync(
    'tests/example.test.ts',
    `import { describe, it, expect } from 'vitest';
import { sum } from '../src/index';

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
`,
  );
  fs.writeFileSync(
    'README.md',
    `# ${projectName}

> A modern Node.js + TypeScript project scaffolded with [create-ts-craftskillz](https://www.npmjs.com/package/create-ts-craftskillz).

---

## 🚀 Features

- ⚡ Built with **TypeScript**
- 🧹 Pre-configured with **ESLint** + **Prettier**
- 🧪 Ready for **Vitest** unit testing
- 🪄 VSCode settings included
- 📦 Simple build system with \`tsc\`

---

## 🧰 Available Scripts

| Command | Description |
|----------|--------------|
| \`pnpm build\` | Compile TypeScript into JavaScript |
| \`pnpm dev\` | Watch mode — auto rebuild on save |
| \`pnpm lint\` | Run ESLint on all \`.ts\` files |
| \`pnpm format\` | Format code with Prettier |
| \`pnpm test\` | Run tests with Vitest |
| \`pnpm test:watch\` | Run tests in watch mode |

---

## 🧪 Example Test

See \`tests/example.test.ts\` for a sample test.

---

## 🧱 Project Structure

\`\`\`
${projectName}/
├── src/
│   └── index.ts
├── tests/
│   └── example.test.ts
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── .vscode/
│   └── settings.json
├── package.json
└── README.md
\`\`\`

---

## 🪄 Getting Started

\`\`\`bash
pnpm install
pnpm run dev
\`\`\`

---

## 🧾 License

This project is licensed under the [MIT License](LICENSE).
`,
  );
}

function installEsLintAndPrettierAndVitest() {
  // -----------------------------
  // Install dev dependencies
  // -----------------------------
  console.log('\n📘 Installing dev dependencies...');
  run(
    'pnpm add -D typescript @types/node eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier eslint-plugin-prettier vitest @vitest/coverage-v8',
  );

  // -----------------------------
  // ESLint + Prettier
  // -----------------------------
  console.log('\n🧹 Setting up ESLint + Prettier...');
  fs.writeFileSync(
    '.eslintrc.json',
    JSON.stringify(
      {
        parser: '@typescript-eslint/parser',
        parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
        plugins: ['@typescript-eslint'],
        extends: [
          'eslint:recommended',
          'plugin:@typescript-eslint/recommended',
          'plugin:prettier/recommended',
        ],
        rules: {
          '@typescript-eslint/no-unused-vars': ['warn'],
          'no-console': 'off',
        },
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    '.prettierrc',
    JSON.stringify(
      {
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
        printWidth: 80,
      },
      null,
      2,
    ),
  );
}

function configureTsConfigJSON() {
  // -----------------------------
  // TypeScript config
  // -----------------------------
  console.log('\n⚙️ Initializing TypeScript...');
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      rootDir: 'src',
      outDir: 'dist',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      sourceMap: true,
    },
    include: ['src'],
  };
  fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
}

function configureVSCode() {
  // -----------------------------
  // VSCode config
  // -----------------------------
  console.log('\n💻 Configuring VSCode...');
  fs.mkdirSync('.vscode', { recursive: true });
  fs.writeFileSync(
    '.vscode/settings.json',
    JSON.stringify(
      {
        'editor.formatOnSave': true,
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
        'eslint.validate': ['typescript', 'typescriptreact'],
      },
      null,
      2,
    ),
  );
}

function configureGitIgnore() {
  // -----------------------------
  // .gitignore
  // -----------------------------
  fs.writeFileSync('.gitignore', 'node_modules\n.dist\n.env\n');
}
