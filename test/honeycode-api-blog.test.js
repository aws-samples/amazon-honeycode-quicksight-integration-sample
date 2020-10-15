// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const HoneycodeApiBlog = require('../lib/honeycode-api-blog-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new HoneycodeApiBlog.HoneycodeApiBlogStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
