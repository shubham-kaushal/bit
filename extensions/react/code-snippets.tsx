export const workspaceEx = {
  'teambit.bit/workspace': {
    name: 'a-ws-using-react',
    icon: 'https://domain.com/my-ws-icon.svg',
    defaultScope: 'my-org.my-scope',
  },
  'teambit.bit/react': {
    compiler: 'babel',
    tester: 'mocha',
    reactVersion: '^16.13.1',
  },
  'teambit.bit/variants': {
    'components/react/ui-primitives': {
      compiler: 'ts',
      tester: 'jest',
    },
  },
  'teambit.bit/dependency-resolver': {
    packageManager: 'teambit.bit/pnpm',
    policy: {
      peerDependencies: {
        react: '^16.13.1',
        '@babel/runtime': '^7.11.2',
        'react-dom': '^16.13.1',
      },
    },
  },
};

export const workspaceProps = [
  {
    name: 'compiler',
    type: "'babel' | 'ts'",
    description: 'Choose a compiler',
    default: { value: "'ts'" },
  },
  {
    name: 'tester',
    type: "'jest' | 'mocha'",
    description: 'Choose a test runner.',
    default: { value: "'jest'" },
  },
  {
    name: 'reactVersion',
    type: 'string',
    description: 'Choose a version of React.',
    default: { value: "'^16.13.1'" },
  },
];

export const extensionDirStructure = `
$ mkdir -p extensions/custom-react
$ touch extensions/custom-react/custom-react.extension.ts
$ touch extensions/custom-react/index.ts
`;
