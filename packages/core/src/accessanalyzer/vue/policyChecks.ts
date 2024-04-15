/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import * as fs from 'fs'
import { getLogger, Logger } from '../../shared/logger'
import { localize } from '../../shared/utilities/vsCodeUtils'
import { VueWebview } from '../../webviews/main'
import { ExtContext } from '../../shared/extensions'
//import { telemetry } from '../../shared/telemetry/telemetry'
import { AccessAnalyzer } from 'aws-sdk'

// interface ValidatePolicyApiMessage {
//     region: string
// }

// interface CheckNoNewAccessPolicyApiMessage {
//     region: string
// }

// interface CheckAccessNotGrantedPolicyApiMessage {
//     region: string
// }

export interface PolicyChecksInitialData {
    referenceFilePath: string
    tfConfigPath: string
    cfnParameterPath: string
    referenceDocument: string
}

export class PolicyChecksWebview extends VueWebview {
    public static readonly sourcePath: string = 'src/accessanalyzer/vue/index.js'
    public readonly id = 'policyChecks'

    //private readonly logger = getLogger()

    public constructor(
        private readonly data: PolicyChecksInitialData,
        private readonly client: AccessAnalyzer, //private readonly s3Client: S3
        public readonly onChangeInputPath = new vscode.EventEmitter<string>(),
        public readonly onChangeReferenceFilePath = new vscode.EventEmitter<string>(),
        public readonly onChangeTerraformConfigPath = new vscode.EventEmitter<string>(),
        public readonly onChangeCloudformationParameterFilePath = new vscode.EventEmitter<string>()
    ) {
        super(PolicyChecksWebview.sourcePath)
        this._setActiveTextEditorListener()
    }

    public init(): typeof this.data {
        return this.data
    }

    public getReferenceDocument(path: string): string {
        return _getReferenceDocument(path)
    }

    public _setActiveTextEditorListener() {
        vscode.window.onDidChangeActiveTextEditor((message: any) => {
            const editedFile = vscode.window.activeTextEditor?.document
            this.onChangeInputPath.fire(editedFile!.uri.path)
        })
    }
    public _setActiveConfigurationListener() {
        vscode.workspace.onDidChangeConfiguration((config: vscode.ConfigurationChangeEvent) => {
            if (config.affectsConfiguration('aws.accessAnalyzer.policyChecks.referencePolicyFilePath')) {
                this.onChangeReferenceFilePath.fire(
                    vscode.workspace.getConfiguration().get('aws.accessAnalyzer.policyChecks.referencePolicyFilePath')!
                )
            } else if (config.affectsConfiguration('aws.accessAnalyzer.policyChecks.terraformConfigFilePath')) {
                this.onChangeTerraformConfigPath.fire(
                    vscode.workspace.getConfiguration().get('aws.accessAnalyzer.policyChecks.terraformConfigFilePath')!
                )
            } else if (config.affectsConfiguration('aws.accessAnalyzer.policyChecks.cloudFormationParameterFilePath')) {
                this.onChangeCloudformationParameterFilePath.fire(
                    vscode.workspace
                        .getConfiguration()
                        .get('aws.accessAnalyzer.policyChecks.cloudFormationParameterFilePath')!
                )
            }
        })
    }

    public async validatePolicy(documentType: string, policyType: string) {
        this.client.validatePolicy({ policyDocument: '', policyType })
    }

    public async checkNoNewAccess() {}

    public async checkAccessNotGranted() {}
}

const Panel = VueWebview.compilePanel(PolicyChecksWebview)

export async function renderPolicyChecks(context: ExtContext): Promise<void> {
    const logger: Logger = getLogger()
    try {
        const client = new AccessAnalyzer({ region: context.regionProvider.defaultRegionId })
        const referencePolicyFilePath: string = vscode.workspace
            .getConfiguration()
            .get('aws.accessAnalyzer.policyChecks.referencePolicyFilePath')!
        const tfConfigPath: string = vscode.workspace
            .getConfiguration()
            .get('aws.accessAnalyzer.policyChecks.terraformConfigFilePath')!
        const cfnParameterPath: string = vscode.workspace
            .getConfiguration()
            .get('aws.accessAnalyzer.policyChecks.cloudFormationParameterFilePath')!

        const wv = new Panel(
            context.extensionContext,
            {
                referenceFilePath: referencePolicyFilePath ? referencePolicyFilePath : '',
                tfConfigPath: tfConfigPath ? tfConfigPath : '',
                cfnParameterPath: cfnParameterPath ? cfnParameterPath : '',
                referenceDocument: _getReferenceDocument(referencePolicyFilePath),
            },
            client
        )
        await wv.show({
            viewColumn: vscode.ViewColumn.Beside,
            title: localize('AWS.policyChecks.title', 'IAM Policy Checks'),
        })
    } catch (err) {
        logger.error(err as Error)
    }
}

function _getReferenceDocument(path: string): string {
    if (fs.existsSync(path)) {
        return fs.readFileSync(path).toString()
    }
    return ''
}
