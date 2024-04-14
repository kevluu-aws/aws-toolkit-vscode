/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
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
    region: string
}

export class PolicyChecksWebview extends VueWebview {
    public static readonly sourcePath: string = 'src/accessanalyzer/vue/index.js'
    public readonly id = 'policyChecks'

    //private readonly logger = getLogger()

    public constructor(
        private readonly data: PolicyChecksInitialData,
        private readonly client: AccessAnalyzer
    ) //private readonly s3Client: S3
    {
        super(PolicyChecksWebview.sourcePath)
    }

    public getData() {
        return this.data
    }

    public async validatePolicyApi() {
        this.client.validatePolicy({ policyDocument: '', policyType: '' })
    }
}

const Panel = VueWebview.compilePanel(PolicyChecksWebview)

export async function renderPolicyChecks(context: ExtContext): Promise<void> {
    const logger: Logger = getLogger()

    try {
        const client = new AccessAnalyzer({ region: context.regionProvider.defaultRegionId })
        const wv = new Panel(
            context.extensionContext,
            {
                region: context.regionProvider.defaultRegionId,
            },
            client
        )
        await wv.show({
            viewColumn: vscode.ViewColumn.Beside,
            title: localize('AWS.policyChecks.title', 'Policy Checks'),
        })
    } catch (err) {
        logger.error(err as Error)
    }
}
