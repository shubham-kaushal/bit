import { ComponentFactory } from '@teambit/component';
import { Schema } from '@teambit/graphql';

import gql from 'graphql-tag';

import { ApiExtractorMain } from './api-extractor.main.runtime';

export function apiExtractorSchema(apiExtractor: ApiExtractorMain): Schema {
  return {
    typeDefs: gql`
      extend type ComponentHost {
        getDoc(id: String!): [ApiDocJson]
      }

      type ApiDocJson {
        componentName: String
        apiJsonFileJSON: ApiJsonFileJSON
        tsdocMetadataFileJSON: TsdocMetadataFileJSON
      }

      type ApiJsonFileJSON {
        metadata: MetadataObject
        kind: String
        canonicalReference: String
        docComment: String
        name: String
        members: [Member]
      }

      type MetadataObject {
        toolPackage: String
        toolVersion: String
        schemaVersion: Int
        oldestForwardsCompatibleVersion: Int
      }

      type TsdocMetadataFileJSON {
        tsdocVersion: String
        toolPackages: [ToolPackage]
      }

      type ToolPackage {
        packageName: String
        packageVersion: String
      }

      type Member {
        kind: String
        canonicalReference: String
        docComment: String
        name: String
        excerptTokens: [ExcerptToken]
        members: [Member]
        returnTypeTokenRange: ReturnTypeTokenRange
        releaseTag: String
        overloadIndex: Int
        parameters: [Parameter]
      }

      type Parameter {
        parameterName: String
        parameterTypeTokenRange: ParameterTypeTokenRange
      }

      type ParameterTypeTokenRange {
        startIndex: Int
        endIndex: Int
      }

      type ReturnTypeTokenRange {
        startIndex: Int
        endIndex: Int
      }

      type ExcerptToken {
        kind: String
        text: String
        canonicalReference: String
      }
    `,
    resolvers: {
      ComponentHost: {
        getDoc: async (host: ComponentFactory, { id }: { id: string }) => {
          const componentId = await host.resolveComponentId(id);
          const testsResults = apiExtractor.generateComponentDocsByComponentID(componentId);
          if (!testsResults) return null;
          return testsResults;
        },
      },
    },
  };
}
