import { OpenAPIV3 } from 'openapi-types';

export type ReferenceObject = OpenAPIV3.ReferenceObject;
export type ExternalDocumentationObject = OpenAPIV3.ExternalDocumentationObject;
export type ContactObject = OpenAPIV3.ContactObject;
export type LicenseObject = OpenAPIV3.LicenseObject;
export type InfoObject = OpenAPIV3.InfoObject;
export type ServerVariableObject = OpenAPIV3.ServerVariableObject;
export type ServerObject = OpenAPIV3.ServerObject;
export type DiscriminatorObject = OpenAPIV3.DiscriminatorObject;
export type XmlObject = OpenAPIV3.XMLObject;
export type SchemaObject = OpenAPIV3.SchemaObject;
export type SchemasObject = Record<string, SchemaObject>;
export type ScopesObject = Record<string, string>;

export type HttpSecurityScheme = OpenAPIV3.HttpSecurityScheme;
export type ApiKeySecurityScheme = OpenAPIV3.ApiKeySecurityScheme;
export type OAuth2SecurityScheme = OpenAPIV3.OAuth2SecurityScheme;
export type OpenIdSecurityScheme = OpenAPIV3.OpenIdSecurityScheme;
export type SecuritySchemeObject = OpenAPIV3.SecuritySchemeObject;
export type SecuritySchemeType = SecuritySchemeObject['type'];

export type OAuthFlowObject = NonNullable<
  OAuth2SecurityScheme['flows']
>[keyof OAuth2SecurityScheme['flows']];
export type OAuthFlowsObject = OAuth2SecurityScheme['flows'];
