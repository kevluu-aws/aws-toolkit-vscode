/*! * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. * SPDX-License-Identifier: Apache-2.0 */

<template>
    <div id="app">
        <h1>Policy Checks</h1>
        <div class="container button-container" style="justify-content: space-between">
            <h1>API:</h1>
        </div>
        <h3>Select a resource:</h3>
        <h3>Select a method:</h3>
        <br />
        <h3>Query string (optional)</h3>
        <br />
        <br />
        <textarea style="width: 100%; margin-bottom: 10px" rows="10" cols="90"></textarea>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { WebviewClientFactory } from '../../webviews/client'
import saveData from '../../webviews/mixins/saveData'
import { PolicyChecksWebview } from './policyChecks'

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
