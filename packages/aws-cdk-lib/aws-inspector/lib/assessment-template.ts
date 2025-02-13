import { IResource } from '../../core';

/**
 * Interface for a Inspector Assessment Template resource.
 */
export interface IAssessmentTemplate extends IResource {
  /**
   * The ARN of the assessment template.
   *
   * @attribute
   */
  readonly assessmentTemplateArn: string;
}
