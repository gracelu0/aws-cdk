import { Template } from '../../../assertions';
import * as sfn from '../../../aws-stepfunctions';
import * as cdk from '../../../core';
import * as tasks from '../../lib';

let stack: cdk.Stack;

beforeEach(() => {
  // GIVEN
  stack = new cdk.Stack();
});

test('Set termination protection with static ClusterId and TerminationProtected', () => {
  // WHEN
  const task = new tasks.EmrSetClusterTerminationProtection(stack, 'Task', {
    clusterId: 'ClusterId',
    terminationProtected: false,
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toEqual({
    Type: 'Task',
    Resource: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':states:::elasticmapreduce:setClusterTerminationProtection',
        ],
      ],
    },
    End: true,
    Parameters: {
      ClusterId: 'ClusterId',
      TerminationProtected: false,
    },
  });
});

test('Set termination protection with static ClusterId and TerminationProtected - using JSONata', () => {
  // WHEN
  const task = tasks.EmrSetClusterTerminationProtection.jsonata(stack, 'Task', {
    clusterId: 'ClusterId',
    terminationProtected: false,
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toEqual({
    Type: 'Task',
    QueryLanguage: 'JSONata',
    Resource: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':states:::elasticmapreduce:setClusterTerminationProtection',
        ],
      ],
    },
    End: true,
    Arguments: {
      ClusterId: 'ClusterId',
      TerminationProtected: false,
    },
  });
});

test('task policies are generated', () => {
  // WHEN
  const task = new tasks.EmrSetClusterTerminationProtection(stack, 'Task', {
    clusterId: 'ClusterId',
    terminationProtected: false,
  });
  new sfn.StateMachine(stack, 'SM', {
    definitionBody: sfn.DefinitionBody.fromChainable(task),
  });

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: 'elasticmapreduce:SetTerminationProtection',
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':elasticmapreduce:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':cluster/*',
              ],
            ],
          },
        },
      ],
    },
  });
});

test('Set termination protection with static ClusterId and TerminationProtected from payload', () => {
  // WHEN
  const task = new tasks.EmrSetClusterTerminationProtection(stack, 'Task', {
    clusterId: 'ClusterId',
    terminationProtected: sfn.TaskInput.fromJsonPathAt('$.TerminationProtected').value,
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toEqual({
    Type: 'Task',
    Resource: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':states:::elasticmapreduce:setClusterTerminationProtection',
        ],
      ],
    },
    End: true,
    Parameters: {
      'ClusterId': 'ClusterId',
      'TerminationProtected.$': '$.TerminationProtected',
    },
  });
});

test('Set termination protection with ClusterId from payload and static TerminationProtected', () => {
  // WHEN
  const task = new tasks.EmrSetClusterTerminationProtection(stack, 'Task', {
    clusterId: sfn.TaskInput.fromJsonPathAt('$.ClusterId').value,
    terminationProtected: false,
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toEqual({
    Type: 'Task',
    Resource: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':states:::elasticmapreduce:setClusterTerminationProtection',
        ],
      ],
    },
    End: true,
    Parameters: {
      'ClusterId.$': '$.ClusterId',
      'TerminationProtected': false,
    },
  });
});
