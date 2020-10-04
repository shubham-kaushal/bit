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
    type: 'string',
    description: 'An element type to render as (string or function).',
    required: true,
    default: { value: 'h1' },
  },
  {
    name: 'heading',
    type: 'string',
    description: 'An element type to render as (string or function).',
    required: true,
    default: { value: 'h1' },
  },
  {
    name: 'heading',
    type: 'string',
    description: 'An element type to render as (string or function).',
    required: true,
    default: { value: 'h1' },
  },
];
