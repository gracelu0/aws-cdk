import * as scheduler from '@aws-cdk/aws-scheduler-alpha';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, Duration, Stack } from 'aws-cdk-lib';
import { CfnAssessmentTarget, CfnAssessmentTemplate, AssessmentTemplate } from 'aws-cdk-lib/aws-inspector';
import { InspectorStartAssessmentRun } from '../lib';

/*
 * Pre-Stack Verification:
 * Create a managed EC2 instance via console: https://docs.aws.amazon.com/systems-manager/latest/userguide/getting-started-launch-managed-instance.html
 * and install Amazon Inspector Agent: https://docs.aws.amazon.com/inspector/v1/userguide/inspector_installing-uninstalling-agents.html#install-run-command
 *
 * Stack verification steps:
 * An inspector assessment run by the scheduler
 * The assertion checks whether the assessment run
 */
const app = new App();
const stack = new Stack(app, 'aws-cdk-scheduler-targets-inspector-start-assessment-run');

const assessmentTarget = new CfnAssessmentTarget(stack, 'MyAssessmentTarget');
const cfnAssessmentTemplate = new CfnAssessmentTemplate(stack, 'MyAssessmentTemplate', {
  assessmentTargetArn: assessmentTarget.attrArn,
  durationInSeconds: 3600,
  // https://docs.aws.amazon.com/inspector/v1/userguide/inspector_rules-arns.html#us-east-1
  rulesPackageArns: ['arn:aws:inspector:us-east-1:316112463485:rulespackage/0-gEjTy7T7'],
});

const assessmentTemplate = AssessmentTemplate.fromCfnAssessmentTemplate(stack, 'MyAssessmentTemplate', cfnAssessmentTemplate);

new scheduler.Schedule(stack, 'Schedule', {
  schedule: scheduler.ScheduleExpression.rate(Duration.minutes(10)),
  target: new InspectorStartAssessmentRun(assessmentTemplate),
});

const integrationTest = new IntegTest(app, 'integrationtest-inspector-start-assessment-run', {
  testCases: [stack],
  stackUpdateWorkflow: false, // this would cause the schedule to trigger with the old code
});

// Verifies that the assessment run by the scheduler
integrationTest.assertions.awsApiCall('Inspector', 'listAssessmentRuns', {
  AssessmentTemplateArns: [assessmentTemplate.assessmentTemplateArn],
}).assertAtPath(
  'assessmentRunArns.0',
  ExpectedResult.stringLikeRegexp(assessmentTemplate.assessmentTemplateArn),
).waitForAssertions({
  interval: Duration.seconds(30),
  totalTimeout: Duration.minutes(10),
});
