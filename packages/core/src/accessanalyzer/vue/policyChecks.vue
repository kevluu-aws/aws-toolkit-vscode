/*! * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. * SPDX-License-Identifier: Apache-2.0 */

<template>
    <div id="app">
        <div>
            <h1>IAM Policy Checks</h1>
            <h3>Getting Started</h3>
            <p>
                Policy Checks requires Python 3.6+ and the respective Python CLI tools installed, based on the document
                type:
            </p>
            <ul>
                <li>
                    <a href="https://github.com/awslabs/aws-cloudformation-iam-policy-validator"
                        >IAM Policy Validator for CloudFormation</a
                    >
                </li>
                <li>
                    <a href="https://github.com/awslabs/terraform-iam-policy-validator"
                        >IAM Policy Validator for Terraform</a
                    >
                </li>
            </ul>
            <p>Policy checks should be run until issues are no longer found in your policy document.</p>
            <div style="justify-content: space-between">
                <div style="display: flex">
                    <div style="display: block; margin-right: 25px">
                        <label for="select-document-type" style="display: block; margin-top: 5px; margin-bottom: 3px"
                            >Document Type</label
                        >
                        <select id="select-document-type">
                            <option value="JSON Policy Language">JSON Policy Language</option>
                            <option value="CloudFormation">CloudFormation</option>
                            <option value="Terraform">Terraform</option>
                        </select>
                    </div>
                    <div style="display: block">
                        <label for="select-policy-type" style="display: block; margin-top: 5px; margin-bottom: 3px"
                            >Policy Type</label
                        >
                        <select id="select-policy-type">
                            <option value="Identity">Identity</option>
                            <option value="Resource">Resource</option>
                        </select>
                    </div>
                </div>
                <label for="input-path" style="display: block; cursor: not-allowed; margin-top: 15px; opacity: 0.4">
                    Currently Read Input File
                </label>
                <input
                    type="text"
                    style="display: flex; cursor: not-allowed; box-sizing: border-box; position: relative; opacity: 0.4"
                    id="input-path"
                    placeholder="Input policy file path"
                    readOnly
                    disabled
                />
            </div>
        </div>
        <hr style="margin-top: 25px" />
        <div class="validate-container">
            <h2 style="border-bottom-style: none">Validate Policies</h2>
            <div style="display: grid">
                <p>
                    IAM Access Analyzer validates your policy against IAM policy grammar and AWS best practices. You can
                    view policy validation check findings that include security warnings, errors, general warnings, and
                    suggestions for your policy. These findings provide actionable recommendations that help you author
                    policies that are functional and conform to security best practices.
                </p>
                <div>
                    <button id="validate-run-button">Run Policy Validation</button>
                </div>
            </div>
        </div>
        <hr style="margin-top: 25px" />
        <div class="custom-checks-container">
            <h2 style="border-bottom-style: none">Custom Policy Checks</h2>
            <div style="display: block">
                <p>
                    IAM Access Analyzer validates your policies against your specified security standards using AWS
                    Identity and Access Management Access Analyzer custom policy checks.
                </p>
                <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-custom-policy-checks.html"
                    >More about Custom Policy Checks</a
                >
                <div style="display: block">
                    <label for="select-check-type" style="display: block; margin-top: 15px; margin-bottom: 3px"
                        >Check Type</label
                    >
                    <select id="select-check-type" style="margin-bottom: 5px">
                        <option value="CheckNoNewAccess">CheckNoNewAccess</option>
                        <option value="CheckAccessNotGranted">CheckAccessNotGranted</option>
                    </select>
                </div>
                <div>
                    <label for="input-path" style="display: block; margin-bottom: 3px">Reference File</label>
                    <input
                        type="text"
                        style="display: flex; box-sizing: border-box; position: relative; margin-bottom: 10px"
                        id="input-path"
                        placeholder="Reference policy file path"
                        size="25"
                    />
                </div>
                <div>
                    <textarea
                        style="
                            width: 100%;
                            margin-bottom: 10px;
                            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial,
                                sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
                        "
                        rows="30"
                        value=""
                        placeholder="Enter reference policy document"
                    ></textarea>
                </div>
                <div style="display: grid">
                    <b style="margin-bottom: 5px">A charge is associated with each custom policy check.</b>
                    <div>
                        <button style="margin-bottom: 5px" id="custom-checks-run-button">
                            Run Custom Policy Check
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { WebviewClientFactory } from '../../webviews/client'
import saveData from '../../webviews/mixins/saveData'
import { PolicyChecksWebview } from './policyChecks'
import '@../../../resources/css/base.css'
import '@../../../resources/css/securityIssue.css'

const client = WebviewClientFactory.create<PolicyChecksWebview>()

export default defineComponent({
    mixins: [saveData],
    data: () => ({
        initialData: {
            region: 'us-west-2',
        },
    }),
    async created() {
        this.initialData = await client.getData()
    },
    methods: {},
    computed: {},
})
</script>
