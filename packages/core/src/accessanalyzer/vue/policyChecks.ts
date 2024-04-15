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
import { exec } from 'child_process'

export interface PolicyChecksInitialData {
    referenceFilePath: string
    tfConfigPath: string
    cfnParameterPath: string
    referenceDocument: string
}

export class PolicyChecksWebview extends VueWebview {
    public static readonly sourcePath: string = 'src/accessanalyzer/vue/index.js'
    public readonly id = 'policyChecks'
    private static editedDocumentFileName: string = vscode.window.activeTextEditor?.document.uri.path!

    //private readonly logger = getLogger()

    public constructor(
        private readonly data: PolicyChecksInitialData,
        private readonly client: AccessAnalyzer, //private readonly s3Client: S3
        private readonly region: string,
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
            PolicyChecksWebview.editedDocumentFileName = editedFile!.uri.path
            if (editedFile) {
                this.onChangeInputPath.fire(editedFile!.uri.path)
            }
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

    public async validatePolicy(
        documentType: string,
        policyType: string,
        tfConfigPath?: string,
        cfnParameterPath?: string
    ) {
        const document = PolicyChecksWebview.editedDocumentFileName
        switch (documentType) {
            case 'JSON Policy Language':
                this.client.validatePolicy(
                    { policyDocument: vscode.window.activeTextEditor?.document.getText()!, policyType },
                    function (err, data) {
                        if (err) {
                            console.log(err, err.stack)
                        } else {
                            if (data.findings.length > 0) {
                                data.findings.forEach((finding: AccessAnalyzer.ValidatePolicyFinding) => {
                                    if (finding.findingType === 'ERROR') {
                                        vscode.window.showErrorMessage(
                                            finding.findingType +
                                                ': ' +
                                                finding.findingDetails +
                                                '\n' +
                                                finding.locations?.toString()
                                        )
                                    } else {
                                        vscode.window.showWarningMessage(
                                            finding.findingType +
                                                ': ' +
                                                finding.findingDetails +
                                                '\n' +
                                                finding.locations?.toString()
                                        )
                                    }
                                })
                            } else {
                                vscode.window.showInformationMessage(
                                    'Policy checks did not discover any problems with your policy!'
                                )
                            }
                        }
                    }
                )
                return
            case 'Terraform Plan':
                const tfCommand = `tf-policy-validator validate --template-path ${document} --region ${this.region} --config ${tfConfigPath}`
                exec(tfCommand, (err, output) => {
                    if (err) {
                        vscode.window.showErrorMessage('Failed to run command: ' + err.message)
                    } else {
                        const jsonOutput = JSON.parse(output)
                        if (jsonOutput.BlockingFindings.length === 0 && jsonOutput.NonBlockingFindings.length === 0) {
                            vscode.window.showInformationMessage(
                                'Policy checks did not discover any problems with your policy!'
                            )
                        } else {
                            jsonOutput.BlockingFindings.forEach((finding: any) => {
                                vscode.window.showErrorMessage(
                                    finding.findingType +
                                        ': ' +
                                        finding.details.findingDetails +
                                        '\n' +
                                        finding.details.locations?.toLocaleString()
                                )
                            })
                            jsonOutput.NonBlockingFindings.forEach((finding: any) => {
                                vscode.window.showWarningMessage(
                                    finding.findingType +
                                        ': ' +
                                        finding.details.findingDetails +
                                        '\n' +
                                        finding.resourceName +
                                        '\n' +
                                        finding.policyName
                                )
                            })
                        }
                    }
                })
                return
            case 'CloudFormation':
                const cfnCommand = cfnParameterPath
                    ? `cfn-policy-validator validate --template-path ${document} --region ${this.region} --parameters ${cfnParameterPath}`
                    : `cfn-policy-validator validate --template-path ${document} --region ${this.region}`
                exec(cfnCommand, (err, output) => {
                    if (err) {
                        vscode.window.showErrorMessage('Failed to run command: ' + err.message)
                    } else {
                        const jsonOutput = JSON.parse(output)
                        if (jsonOutput.BlockingFindings.length === 0 && jsonOutput.NonBlockingFindings.length === 0) {
                            vscode.window.showInformationMessage(
                                'Policy checks did not discover any problems with your policy!'
                            )
                        } else {
                            jsonOutput.BlockingFindings.forEach((finding: any) => {
                                vscode.window.showErrorMessage(
                                    finding.findingType +
                                        ': ' +
                                        finding.details.findingDetails +
                                        '\n' +
                                        finding.details.locations?.toLocaleString()
                                )
                            })
                            jsonOutput.NonBlockingFindings.forEach((finding: any) => {
                                vscode.window.showWarningMessage(
                                    finding.findingType +
                                        ': ' +
                                        finding.details.findingDetails +
                                        '\n' +
                                        finding.resourceName +
                                        '\n' +
                                        finding.policyName
                                )
                            })
                        }
                    }
                })
        }
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
            client,
            context.regionProvider.defaultRegionId
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
