import { r as resolveAwsSdkSigV4Config, n as normalizeProvider, g as getSmithyContext, E as EndpointCache, b as resolveEndpoint, d as awsEndpointFunctions, e as customEndpointFunctions, N as NoOpLogger, A as AwsSdkSigV4Signer, f as NoAuthSigner, h as emitWarningIfUnsupportedVersion, i as resolveDefaultsModeConfig, j as emitWarningIfUnsupportedVersion$1, H as Hash, k as createDefaultUserAgentProvider, l as calculateBodyLength, u as loadConfigsForDefaultMode, m as NODE_APP_ID_CONFIG_OPTIONS, o as NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, p as NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, q as NODE_RETRY_MODE_CONFIG_OPTIONS, D as DEFAULT_RETRY_MODE, s as NODE_REGION_CONFIG_OPTIONS, t as NODE_MAX_ATTEMPT_CONFIG_OPTIONS, v as NODE_REGION_CONFIG_FILE_OPTIONS, w as getHttpHandlerExtensionConfiguration, x as getDefaultExtensionConfiguration, y as getAwsRegionExtensionConfiguration, z as resolveHttpHandlerRuntimeConfig, B as resolveDefaultRuntimeConfig, F as resolveAwsRegionExtensionConfiguration, C as Client, G as resolveUserAgentConfig, I as resolveRetryConfig, J as resolveRegionConfig, K as resolveEndpointConfig, M as getUserAgentPlugin, O as getRetryPlugin, P as getContentLengthPlugin, Q as getHostHeaderPlugin, R as getLoggerPlugin, S as getRecursionDetectionPlugin, T as getHttpAuthSchemeEndpointRuleSetPlugin, V as getHttpSigningPlugin, L as resolveHostHeaderConfig, U as DefaultIdentityProviderConfig, W as ServiceException, X as SENSITIVE_STRING, Y as withBaseException, Z as decorateServiceException, a as Command, _ as getEndpointPlugin } from './index-GlftCKGz.js';
import { A as toUtf8, B as fromUtf8, C as parseUrl, F as toBase64, G as fromBase64, I as loadConfig, J as streamCollector, N as NodeHttpHandler, Q as defaultProvider, H as HttpRequest, M as expectString, K as expectNonNull, R as parseEpochTimestamp, S as expectNumber, P as getSerdePlugin } from './index-CzuDoCE3.js';
import 'buffer';
import 'stream';
import 'node:stream';
import 'http';
import 'https';
import 'http2';
import 'os';
import 'path';
import 'crypto';
import { _ as _json, p as parseJsonBody, a as parseJsonErrorBody, l as loadRestJsonErrorCode, t as take } from './parseJsonBody-LuUmt5Qk.js';
import 'process';
import 'fs';
import './index-bpYt4yzm.js';
import 'tty';
import 'util';
import 'url';
import 'fs/promises';
import 'child_process';
import 'events';
import './llm-providers-CDRJKbAa.js';
import 'assert';
import 'zlib';
import 'chalk';
import 'punycode';
import 'formdata-node';

const defaultCognitoIdentityHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
        operation: getSmithyContext(context).operation,
        region: (await normalizeProvider(config.region)()) ||
            (() => {
                throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
            })(),
    };
};
function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
        schemeId: "aws.auth#sigv4",
        signingProperties: {
            name: "cognito-identity",
            region: authParameters.region,
        },
        propertiesExtractor: (config, context) => ({
            signingProperties: {
                config,
                context,
            },
        }),
    };
}
function createSmithyApiNoAuthHttpAuthOption(authParameters) {
    return {
        schemeId: "smithy.api#noAuth",
    };
}
const defaultCognitoIdentityHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
        case "GetCredentialsForIdentity": {
            options.push(createSmithyApiNoAuthHttpAuthOption());
            break;
        }
        case "GetId": {
            options.push(createSmithyApiNoAuthHttpAuthOption());
            break;
        }
        case "GetOpenIdToken": {
            options.push(createSmithyApiNoAuthHttpAuthOption());
            break;
        }
        case "UnlinkIdentity": {
            options.push(createSmithyApiNoAuthHttpAuthOption());
            break;
        }
        default: {
            options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
        }
    }
    return options;
};
const resolveHttpAuthSchemeConfig = (config) => {
    const config_0 = resolveAwsSdkSigV4Config(config);
    return {
        ...config_0,
    };
};

const resolveClientEndpointParameters = (options) => {
    return {
        ...options,
        useDualstackEndpoint: options.useDualstackEndpoint ?? false,
        useFipsEndpoint: options.useFipsEndpoint ?? false,
        defaultSigningName: "cognito-identity",
    };
};
const commonParams = {
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
};

var version = "3.772.0";
var packageInfo = {
	version: version};

const w = "required", x = "fn", y = "argv", z = "ref";
const a = true, b = "isSet", c = "booleanEquals", d = "error", e = "endpoint", f = "tree", g = "PartitionResult", h = "getAttr", i = "stringEquals", j = { [w]: false, "type": "String" }, k = { [w]: true, "default": false, "type": "Boolean" }, l = { [z]: "Endpoint" }, m = { [x]: c, [y]: [{ [z]: "UseFIPS" }, true] }, n = { [x]: c, [y]: [{ [z]: "UseDualStack" }, true] }, o = {}, p = { [z]: "Region" }, q = { [x]: h, [y]: [{ [z]: g }, "supportsFIPS"] }, r = { [z]: g }, s = { [x]: c, [y]: [true, { [x]: h, [y]: [r, "supportsDualStack"] }] }, t = [m], u = [n], v = [p];
const _data = { parameters: { Region: j, UseDualStack: k, UseFIPS: k, Endpoint: j }, rules: [{ conditions: [{ [x]: b, [y]: [l] }], rules: [{ conditions: t, error: "Invalid Configuration: FIPS and custom endpoint are not supported", type: d }, { conditions: u, error: "Invalid Configuration: Dualstack and custom endpoint are not supported", type: d }, { endpoint: { url: l, properties: o, headers: o }, type: e }], type: f }, { conditions: [{ [x]: b, [y]: v }], rules: [{ conditions: [{ [x]: "aws.partition", [y]: v, assign: g }], rules: [{ conditions: [m, n], rules: [{ conditions: [{ [x]: c, [y]: [a, q] }, s], rules: [{ conditions: [{ [x]: i, [y]: [p, "us-east-1"] }], endpoint: { url: "https://cognito-identity-fips.us-east-1.amazonaws.com", properties: o, headers: o }, type: e }, { conditions: [{ [x]: i, [y]: [p, "us-east-2"] }], endpoint: { url: "https://cognito-identity-fips.us-east-2.amazonaws.com", properties: o, headers: o }, type: e }, { conditions: [{ [x]: i, [y]: [p, "us-west-1"] }], endpoint: { url: "https://cognito-identity-fips.us-west-1.amazonaws.com", properties: o, headers: o }, type: e }, { conditions: [{ [x]: i, [y]: [p, "us-west-2"] }], endpoint: { url: "https://cognito-identity-fips.us-west-2.amazonaws.com", properties: o, headers: o }, type: e }, { endpoint: { url: "https://cognito-identity-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", properties: o, headers: o }, type: e }], type: f }, { error: "FIPS and DualStack are enabled, but this partition does not support one or both", type: d }], type: f }, { conditions: t, rules: [{ conditions: [{ [x]: c, [y]: [q, a] }], rules: [{ endpoint: { url: "https://cognito-identity-fips.{Region}.{PartitionResult#dnsSuffix}", properties: o, headers: o }, type: e }], type: f }, { error: "FIPS is enabled but this partition does not support FIPS", type: d }], type: f }, { conditions: u, rules: [{ conditions: [s], rules: [{ conditions: [{ [x]: i, [y]: ["aws", { [x]: h, [y]: [r, "name"] }] }], endpoint: { url: "https://cognito-identity.{Region}.amazonaws.com", properties: o, headers: o }, type: e }, { endpoint: { url: "https://cognito-identity.{Region}.{PartitionResult#dualStackDnsSuffix}", properties: o, headers: o }, type: e }], type: f }, { error: "DualStack is enabled but this partition does not support DualStack", type: d }], type: f }, { endpoint: { url: "https://cognito-identity.{Region}.{PartitionResult#dnsSuffix}", properties: o, headers: o }, type: e }], type: f }], type: f }, { error: "Invalid Configuration: Missing Region", type: d }] };
const ruleSet = _data;

const cache = new EndpointCache({
    size: 50,
    params: ["Endpoint", "Region", "UseDualStack", "UseFIPS"],
});
const defaultEndpointResolver = (endpointParams, context = {}) => {
    return cache.get(endpointParams, () => resolveEndpoint(ruleSet, {
        endpointParams: endpointParams,
        logger: context.logger,
    }));
};
customEndpointFunctions.aws = awsEndpointFunctions;

const getRuntimeConfig$1 = (config) => {
    return {
        apiVersion: "2014-06-30",
        base64Decoder: config?.base64Decoder ?? fromBase64,
        base64Encoder: config?.base64Encoder ?? toBase64,
        disableHostPrefix: config?.disableHostPrefix ?? false,
        endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
        extensions: config?.extensions ?? [],
        httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultCognitoIdentityHttpAuthSchemeProvider,
        httpAuthSchemes: config?.httpAuthSchemes ?? [
            {
                schemeId: "aws.auth#sigv4",
                identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
                signer: new AwsSdkSigV4Signer(),
            },
            {
                schemeId: "smithy.api#noAuth",
                identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
                signer: new NoAuthSigner(),
            },
        ],
        logger: config?.logger ?? new NoOpLogger(),
        serviceId: config?.serviceId ?? "Cognito Identity",
        urlParser: config?.urlParser ?? parseUrl,
        utf8Decoder: config?.utf8Decoder ?? fromUtf8,
        utf8Encoder: config?.utf8Encoder ?? toUtf8,
    };
};

const getRuntimeConfig = (config) => {
    emitWarningIfUnsupportedVersion(process.version);
    const defaultsMode = resolveDefaultsModeConfig(config);
    const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
    const clientSharedValues = getRuntimeConfig$1(config);
    emitWarningIfUnsupportedVersion$1(process.version);
    const profileConfig = { profile: config?.profile };
    return {
        ...clientSharedValues,
        ...config,
        runtime: "node",
        defaultsMode,
        bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
        credentialDefaultProvider: config?.credentialDefaultProvider ?? defaultProvider,
        defaultUserAgentProvider: config?.defaultUserAgentProvider ??
            createDefaultUserAgentProvider({ serviceId: clientSharedValues.serviceId, clientVersion: packageInfo.version }),
        maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
        region: config?.region ??
            loadConfig(NODE_REGION_CONFIG_OPTIONS, { ...NODE_REGION_CONFIG_FILE_OPTIONS, ...profileConfig }),
        requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
        retryMode: config?.retryMode ??
            loadConfig({
                ...NODE_RETRY_MODE_CONFIG_OPTIONS,
                default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE,
            }, config),
        sha256: config?.sha256 ?? Hash.bind(null, "sha256"),
        streamCollector: config?.streamCollector ?? streamCollector,
        useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, profileConfig),
        useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, profileConfig),
        userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, profileConfig),
    };
};

const getHttpAuthExtensionConfiguration = (runtimeConfig) => {
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
        setHttpAuthScheme(httpAuthScheme) {
            const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
            if (index === -1) {
                _httpAuthSchemes.push(httpAuthScheme);
            }
            else {
                _httpAuthSchemes.splice(index, 1, httpAuthScheme);
            }
        },
        httpAuthSchemes() {
            return _httpAuthSchemes;
        },
        setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
            _httpAuthSchemeProvider = httpAuthSchemeProvider;
        },
        httpAuthSchemeProvider() {
            return _httpAuthSchemeProvider;
        },
        setCredentials(credentials) {
            _credentials = credentials;
        },
        credentials() {
            return _credentials;
        },
    };
};
const resolveHttpAuthRuntimeConfig = (config) => {
    return {
        httpAuthSchemes: config.httpAuthSchemes(),
        httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
        credentials: config.credentials(),
    };
};

const asPartial = (t) => t;
const resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = {
        ...asPartial(getAwsRegionExtensionConfiguration(runtimeConfig)),
        ...asPartial(getDefaultExtensionConfiguration(runtimeConfig)),
        ...asPartial(getHttpHandlerExtensionConfiguration(runtimeConfig)),
        ...asPartial(getHttpAuthExtensionConfiguration(runtimeConfig)),
    };
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return {
        ...runtimeConfig,
        ...resolveAwsRegionExtensionConfiguration(extensionConfiguration),
        ...resolveDefaultRuntimeConfig(extensionConfiguration),
        ...resolveHttpHandlerRuntimeConfig(extensionConfiguration),
        ...resolveHttpAuthRuntimeConfig(extensionConfiguration),
    };
};

class CognitoIdentityClient extends Client {
    config;
    constructor(...[configuration]) {
        const _config_0 = getRuntimeConfig(configuration || {});
        const _config_1 = resolveClientEndpointParameters(_config_0);
        const _config_2 = resolveUserAgentConfig(_config_1);
        const _config_3 = resolveRetryConfig(_config_2);
        const _config_4 = resolveRegionConfig(_config_3);
        const _config_5 = resolveHostHeaderConfig(_config_4);
        const _config_6 = resolveEndpointConfig(_config_5);
        const _config_7 = resolveHttpAuthSchemeConfig(_config_6);
        const _config_8 = resolveRuntimeExtensions(_config_7, configuration?.extensions || []);
        super(_config_8);
        this.config = _config_8;
        this.middlewareStack.use(getUserAgentPlugin(this.config));
        this.middlewareStack.use(getRetryPlugin(this.config));
        this.middlewareStack.use(getContentLengthPlugin(this.config));
        this.middlewareStack.use(getHostHeaderPlugin(this.config));
        this.middlewareStack.use(getLoggerPlugin(this.config));
        this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
        this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
            httpAuthSchemeParametersProvider: defaultCognitoIdentityHttpAuthSchemeParametersProvider,
            identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
                "aws.auth#sigv4": config.credentials,
            }),
        }));
        this.middlewareStack.use(getHttpSigningPlugin(this.config));
    }
    destroy() {
        super.destroy();
    }
}

class CognitoIdentityServiceException extends ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, CognitoIdentityServiceException.prototype);
    }
}

class InternalErrorException extends CognitoIdentityServiceException {
    name = "InternalErrorException";
    $fault = "server";
    constructor(opts) {
        super({
            name: "InternalErrorException",
            $fault: "server",
            ...opts,
        });
        Object.setPrototypeOf(this, InternalErrorException.prototype);
    }
}
class InvalidParameterException extends CognitoIdentityServiceException {
    name = "InvalidParameterException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "InvalidParameterException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidParameterException.prototype);
    }
}
class LimitExceededException extends CognitoIdentityServiceException {
    name = "LimitExceededException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "LimitExceededException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, LimitExceededException.prototype);
    }
}
class NotAuthorizedException extends CognitoIdentityServiceException {
    name = "NotAuthorizedException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "NotAuthorizedException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, NotAuthorizedException.prototype);
    }
}
class ResourceConflictException extends CognitoIdentityServiceException {
    name = "ResourceConflictException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ResourceConflictException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ResourceConflictException.prototype);
    }
}
class TooManyRequestsException extends CognitoIdentityServiceException {
    name = "TooManyRequestsException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "TooManyRequestsException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, TooManyRequestsException.prototype);
    }
}
class ResourceNotFoundException extends CognitoIdentityServiceException {
    name = "ResourceNotFoundException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ResourceNotFoundException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ResourceNotFoundException.prototype);
    }
}
class ExternalServiceException extends CognitoIdentityServiceException {
    name = "ExternalServiceException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ExternalServiceException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ExternalServiceException.prototype);
    }
}
class InvalidIdentityPoolConfigurationException extends CognitoIdentityServiceException {
    name = "InvalidIdentityPoolConfigurationException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "InvalidIdentityPoolConfigurationException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidIdentityPoolConfigurationException.prototype);
    }
}
class DeveloperUserAlreadyRegisteredException extends CognitoIdentityServiceException {
    name = "DeveloperUserAlreadyRegisteredException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "DeveloperUserAlreadyRegisteredException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, DeveloperUserAlreadyRegisteredException.prototype);
    }
}
class ConcurrentModificationException extends CognitoIdentityServiceException {
    name = "ConcurrentModificationException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ConcurrentModificationException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ConcurrentModificationException.prototype);
    }
}
const GetCredentialsForIdentityInputFilterSensitiveLog = (obj) => ({
    ...obj,
    ...(obj.Logins && { Logins: SENSITIVE_STRING }),
});
const CredentialsFilterSensitiveLog = (obj) => ({
    ...obj,
    ...(obj.SecretKey && { SecretKey: SENSITIVE_STRING }),
});
const GetCredentialsForIdentityResponseFilterSensitiveLog = (obj) => ({
    ...obj,
    ...(obj.Credentials && { Credentials: CredentialsFilterSensitiveLog(obj.Credentials) }),
});
const GetIdInputFilterSensitiveLog = (obj) => ({
    ...obj,
    ...(obj.Logins && { Logins: SENSITIVE_STRING }),
});

const se_GetCredentialsForIdentityCommand = async (input, context) => {
    const headers = sharedHeaders("GetCredentialsForIdentity");
    let body;
    body = JSON.stringify(_json(input));
    return buildHttpRpcRequest(context, headers, "/", undefined, body);
};
const se_GetIdCommand = async (input, context) => {
    const headers = sharedHeaders("GetId");
    let body;
    body = JSON.stringify(_json(input));
    return buildHttpRpcRequest(context, headers, "/", undefined, body);
};
const de_GetCredentialsForIdentityCommand = async (output, context) => {
    if (output.statusCode >= 300) {
        return de_CommandError(output, context);
    }
    const data = await parseJsonBody(output.body, context);
    let contents = {};
    contents = de_GetCredentialsForIdentityResponse(data);
    const response = {
        $metadata: deserializeMetadata(output),
        ...contents,
    };
    return response;
};
const de_GetIdCommand = async (output, context) => {
    if (output.statusCode >= 300) {
        return de_CommandError(output, context);
    }
    const data = await parseJsonBody(output.body, context);
    let contents = {};
    contents = _json(data);
    const response = {
        $metadata: deserializeMetadata(output),
        ...contents,
    };
    return response;
};
const de_CommandError = async (output, context) => {
    const parsedOutput = {
        ...output,
        body: await parseJsonErrorBody(output.body, context),
    };
    const errorCode = loadRestJsonErrorCode(output, parsedOutput.body);
    switch (errorCode) {
        case "InternalErrorException":
        case "com.amazonaws.cognitoidentity#InternalErrorException":
            throw await de_InternalErrorExceptionRes(parsedOutput);
        case "InvalidParameterException":
        case "com.amazonaws.cognitoidentity#InvalidParameterException":
            throw await de_InvalidParameterExceptionRes(parsedOutput);
        case "LimitExceededException":
        case "com.amazonaws.cognitoidentity#LimitExceededException":
            throw await de_LimitExceededExceptionRes(parsedOutput);
        case "NotAuthorizedException":
        case "com.amazonaws.cognitoidentity#NotAuthorizedException":
            throw await de_NotAuthorizedExceptionRes(parsedOutput);
        case "ResourceConflictException":
        case "com.amazonaws.cognitoidentity#ResourceConflictException":
            throw await de_ResourceConflictExceptionRes(parsedOutput);
        case "TooManyRequestsException":
        case "com.amazonaws.cognitoidentity#TooManyRequestsException":
            throw await de_TooManyRequestsExceptionRes(parsedOutput);
        case "ResourceNotFoundException":
        case "com.amazonaws.cognitoidentity#ResourceNotFoundException":
            throw await de_ResourceNotFoundExceptionRes(parsedOutput);
        case "ExternalServiceException":
        case "com.amazonaws.cognitoidentity#ExternalServiceException":
            throw await de_ExternalServiceExceptionRes(parsedOutput);
        case "InvalidIdentityPoolConfigurationException":
        case "com.amazonaws.cognitoidentity#InvalidIdentityPoolConfigurationException":
            throw await de_InvalidIdentityPoolConfigurationExceptionRes(parsedOutput);
        case "DeveloperUserAlreadyRegisteredException":
        case "com.amazonaws.cognitoidentity#DeveloperUserAlreadyRegisteredException":
            throw await de_DeveloperUserAlreadyRegisteredExceptionRes(parsedOutput);
        case "ConcurrentModificationException":
        case "com.amazonaws.cognitoidentity#ConcurrentModificationException":
            throw await de_ConcurrentModificationExceptionRes(parsedOutput);
        default:
            const parsedBody = parsedOutput.body;
            return throwDefaultError({
                output,
                parsedBody,
                errorCode,
            });
    }
};
const de_ConcurrentModificationExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new ConcurrentModificationException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_DeveloperUserAlreadyRegisteredExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new DeveloperUserAlreadyRegisteredException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_ExternalServiceExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new ExternalServiceException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_InternalErrorExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new InternalErrorException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_InvalidIdentityPoolConfigurationExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new InvalidIdentityPoolConfigurationException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_InvalidParameterExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new InvalidParameterException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_LimitExceededExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new LimitExceededException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_NotAuthorizedExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new NotAuthorizedException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_ResourceConflictExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new ResourceConflictException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_ResourceNotFoundExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new ResourceNotFoundException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_TooManyRequestsExceptionRes = async (parsedOutput, context) => {
    const body = parsedOutput.body;
    const deserialized = _json(body);
    const exception = new TooManyRequestsException({
        $metadata: deserializeMetadata(parsedOutput),
        ...deserialized,
    });
    return decorateServiceException(exception, body);
};
const de_Credentials = (output, context) => {
    return take(output, {
        AccessKeyId: expectString,
        Expiration: (_) => expectNonNull(parseEpochTimestamp(expectNumber(_))),
        SecretKey: expectString,
        SessionToken: expectString,
    });
};
const de_GetCredentialsForIdentityResponse = (output, context) => {
    return take(output, {
        Credentials: (_) => de_Credentials(_),
        IdentityId: expectString,
    });
};
const deserializeMetadata = (output) => ({
    httpStatusCode: output.statusCode,
    requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
    extendedRequestId: output.headers["x-amz-id-2"],
    cfId: output.headers["x-amz-cf-id"],
});
const throwDefaultError = withBaseException(CognitoIdentityServiceException);
const buildHttpRpcRequest = async (context, headers, path, resolvedHostname, body) => {
    const { hostname, protocol = "https", port, path: basePath } = await context.endpoint();
    const contents = {
        protocol,
        hostname,
        port,
        method: "POST",
        path: basePath.endsWith("/") ? basePath.slice(0, -1) + path : basePath + path,
        headers,
    };
    if (body !== undefined) {
        contents.body = body;
    }
    return new HttpRequest(contents);
};
function sharedHeaders(operation) {
    return {
        "content-type": "application/x-amz-json-1.1",
        "x-amz-target": `AWSCognitoIdentityService.${operation}`,
    };
}

class GetCredentialsForIdentityCommand extends Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AWSCognitoIdentityService", "GetCredentialsForIdentity", {})
    .n("CognitoIdentityClient", "GetCredentialsForIdentityCommand")
    .f(GetCredentialsForIdentityInputFilterSensitiveLog, GetCredentialsForIdentityResponseFilterSensitiveLog)
    .ser(se_GetCredentialsForIdentityCommand)
    .de(de_GetCredentialsForIdentityCommand)
    .build() {
}

class GetIdCommand extends Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AWSCognitoIdentityService", "GetId", {})
    .n("CognitoIdentityClient", "GetIdCommand")
    .f(GetIdInputFilterSensitiveLog, void 0)
    .ser(se_GetIdCommand)
    .de(de_GetIdCommand)
    .build() {
}

export { CognitoIdentityClient, GetCredentialsForIdentityCommand, GetIdCommand };
//# sourceMappingURL=loadCognitoIdentity-CISxwhGJ.js.map
