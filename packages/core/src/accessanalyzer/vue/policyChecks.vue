/*! * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. * SPDX-License-Identifier: Apache-2.0 */

<template>
    <div id="app">
        <div>
            <h1>IAM Policy Checks</h1>
            <p>Policy checks should be run until no issues are found with your policy.</p>
            <div style="justify-content: space-between">
                <label for="input-path" style="display: block; cursor: not-allowed; margin-bottom: 3px; opacity: 0.4"
                    >Currently Read Input File</label
                >
                <input
                    type="text"
                    style="display: flex; cursor: not-allowed; box-sizing: border-box; position: relative; opacity: 0.4"
                    id="input-path"
                    placeholder="Input policy file path"
                    readOnly
                    disabled
                />
                <div style="display: flex">
                    <div style="display: block; margin-right: 15px">
                        <label for="select-document-type" style="display: block; margin-top: 10px; margin-bottom: 3px"
                            >Document Type</label
                        >
                        <select id="select-document-type">
                            <option value="JSON Policy Language">JSON Policy Language</option>
                            <option value="CloudFormation">CloudFormation</option>
                            <option value="Terraform">Terraform</option>
                        </select>
                    </div>
                    <div style="display: block">
                        <label for="select-policy-type" style="display: block; margin-top: 10px; margin-bottom: 3px"
                            >Policy Type</label
                        >
                        <select id="select-policy-type">
                            <option value="Identity">Identity</option>
                            <option value="Resource">Resource</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <hr style="border-top: 1px solid #454545; height: 0; width: 100%; box-sizing: content-box; border: none" />
        <div>
            <h2>Validate Policies</h2>
            <div class="validate-container" style="display: block">
                <p>
                    IAM Access Analyzer validates your policy against IAM policy grammar and AWS best practices. You can
                    view policy validation check findings that include security warnings, errors, general warnings, and
                    suggestions for your policy. These findings provide actionable recommendations that help you author
                    policies that are functional and conform to security best practices.
                </p>
                <div class="button-container">
                    <button id="validate-run-button">Run Policy Validation</button>
                </div>
            </div>
        </div>
        <hr style="border-top: 1px solid #454545; height: 0; width: 100%; box-sizing: content-box; border: none" />
        <div class="custom-checks-container">
            <h2>Custom Policy Checks</h2>
            <div style="display: block">
                <p>
                    You can validate your policies against your specified security standards using AWS Identity and
                    Access Management Access Analyzer custom policy checks.
                </p>
                <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-custom-policy-checks.html"
                    >More about Custom Policy Checks</a
                >
                <div style="display: block">
                    <label for="select-check-type" style="display: block; margin-top: 5px; margin-bottom: 3px"
                        >Check Type</label
                    >
                    <select id="select-check-type" style="margin-bottom: 5px">
                        <option value="CheckNoNewAccess">CheckNoNewAccess</option>
                        <option value="CheckAccessNotGranted">CheckAccessNotGranted</option>
                    </select>
                </div>
                <div>
                    <label for="input-path" style="display:block; margin-bottom:3px; margin">Reference File</label>
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
                        style="width: 100%; margin-bottom: 10px"
                        rows="30"
                        value=""
                        placeholder="Enter policy document"
                    ></textarea>
                </div>
                <div style="display: block">
                    <b>A charge is associated with each custom policy check.</b>
                    <div class="button-container">
                        <button id="custom-checks-run-button">Run Custom Policy Check</button>
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
