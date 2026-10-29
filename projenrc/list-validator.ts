import { writeFileSync } from "node:fs";
import type { IConstruct } from "constructs";
import { Component } from "projen";
import type { IAwesomeList } from "./awesome-list.ts";
import type { Finding, IRule } from "./rules/index.ts";

/**
 * Options for the validator of a list.
 */
export interface ListValidatorOptions {
  /**
   * The rules to run on the list.
   */
  readonly rules: readonly IRule[];

  /**
   * Path of a JSON file to write all findings to, for example for a pull request report.
   *
   * @default - no file
   */
  readonly findingsFile?: string;
}

/**
 * Construct ID of the validator in its list.
 */
const LIST_VALIDATOR_ID = "ListValidator";

/**
 * Runs rules on a list before synth. It shows each finding, and stops synth when there are
 * errors.
 */
export class ListValidator extends Component {
  /**
   * The list to check.
   */
  private readonly list: IAwesomeList;

  /**
   * The rules to run on the list.
   */
  private readonly rules: readonly IRule[];

  /**
   * Path of the JSON file for the findings.
   */
  private readonly findingsFile?: string;

  /**
   * Creates a validator for a list.
   */
  constructor(list: IAwesomeList & IConstruct, options: ListValidatorOptions) {
    super(list, LIST_VALIDATOR_ID);

    this.list = list;
    this.rules = options.rules;
    this.findingsFile = options.findingsFile;
  }

  /**
   * Runs all rules on the list.
   */
  public validate(): Finding[] {
    return this.rules.flatMap((rule) => rule.check(this.list));
  }

  /**
   * Validates the list after all components were added, and before any file is written.
   *
   * @throws if a rule found an error
   */
  public override preSynthesize(): void {
    const findings = this.validate();

    for (const finding of findings) {
      const text = `[${finding.rule}] ${finding.entry}: ${finding.message}`;

      if (finding.level === "error") {
        this.project.logger.error(text);
      } else {
        this.project.logger.warn(text);
      }
    }

    if (this.findingsFile) {
      writeFileSync(this.findingsFile, `${JSON.stringify(findings, undefined, 2)}\n`);
    }

    const errorCount = findings.filter((finding) => finding.level === "error").length;

    if (errorCount > 0) {
      throw new Error(`The list has ${errorCount} error(s). Fix them, then run "npx projen" again.`);
    }
  }
}
