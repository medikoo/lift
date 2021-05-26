import * as lambda from "@aws-cdk/aws-lambda";
import { CfnOutput } from "@aws-cdk/core";
import { FromSchema } from "json-schema-to-ts";
import { AwsComponent } from "./AwsComponent";
import { AwsProvider } from "./Provider";

export const FUNCTION_DEFINITION = {
    type: "object",
    properties: {
        type: { const: "function" },
        handler: { type: "string" },
        timeout: { type: "number" },
        runtime: { type: "string" },
        environment: {
            type: "object",
            additionalProperties: { type: "string" },
        },
    },
    additionalProperties: false,
    required: ["handler"],
} as const;

export class Function extends AwsComponent<typeof FUNCTION_DEFINITION> {
    public readonly function: lambda.Function;
    private readonly functionNameOutput: CfnOutput;

    constructor(provider: AwsProvider, id: string, configuration: FromSchema<typeof FUNCTION_DEFINITION>) {
        super(provider, id, configuration);

        // TODO set options based on configuration
        this.function = new lambda.Function(this.cdkNode, "Function", {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset(process.cwd()),
            handler: configuration.handler,
            environment: configuration.environment,
        });
        this.functionNameOutput = new CfnOutput(this.cdkNode, "FunctionName", {
            description: `Name of the "${id}" function.`,
            value: this.function.functionName,
        });
    }

    /**
     * serverless info
     *     function: complete-function-name
     */
    async infoOutput(): Promise<string | undefined> {
        return await this.getFunctionName();
    }

    variables(): Record<string, () => Promise<string | undefined>> {
        return {};
    }

    references(): Record<string, () => Record<string, unknown>> {
        return {};
    }

    async getFunctionName(): Promise<string | undefined> {
        return this.getOutputValue(this.functionNameOutput);
    }
}