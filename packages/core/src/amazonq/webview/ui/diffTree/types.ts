/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export type DiffTreeFileInfo = {
    zipFilePath: string
    relativePath: string
    rejected: boolean
    changeApplied: boolean
}
