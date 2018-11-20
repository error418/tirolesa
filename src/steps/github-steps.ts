import { Step, ContextHolder, ContextData, StepStatus } from "arroyo";
import * as GitHub from "@octokit/rest";

const client = new GitHub();

export interface GitHubLocation {
	owner: string;
	repo: string;
}

export class CreateRepositoryStep extends Step {
	private repoConfig: GitHub.ReposCreateParams;
	private location: GitHubLocation;

	constructor(location: GitHubLocation, repoConfig: GitHub.ReposCreateParams) {
		super();
		this.repoConfig = repoConfig;
		this.location = location;
	}

	private async createRepository() {
		const result = await client.repos.create(
			Object.assign(this.repoConfig, this.location)
		);

		return result.data;
	}

	protected executeLogic(): ContextData {
		const data = this.createRepository();

		return {
			status: StepStatus.SUCCESS,
			data: data
		};
	}

	protected rollbackLogic() {
		// remove repository
	}
}

export class CreateIssueLabelStep extends Step {
	private label: GitHub.IssuesCreateLabelParams;

	constructor(label: string, color: string, description: string) {
		super();
		this.label = {
			color: color,
			name: label,
			description: description,
			owner: null,
			repo: null
		};
	}

	private async createIssueLabel() {
		return await client.issues.createLabel(this.label);
	}

	protected executeLogic(): ContextData {
		const data = this.createIssueLabel();

		return {
			status: StepStatus.SUCCESS,
			data: data
		};
	}

	protected rollbackLogic() {
		// remove repository
	}
}

export class BranchProtectionStep extends Step {
	private location: GitHubLocation;
	private targetConfig: GitHub.ReposUpdateBranchProtectionParams;
	private currentConfig: GitHub.ReposGetBranchProtectionResponse;

	private branchName: string;

	constructor(location: GitHubLocation, targetConfig: any) {
		super();
		this.location = location;
		this.targetConfig = targetConfig;
	}

	protected async retrievePreviousConfig() {
		const result = await client.repos.getBranchProtection(
			Object.assign(this.location, {
				branch: this.branchName
			})
		);

		this.currentConfig = result.data;
	}

	protected async applyNewConfig() {
		const result = await client.repos.updateBranchProtection(
			Object.assign(this.targetConfig, this.location, { branch: this.branchName })
		);

		return result;
	}

	protected executeLogic(contextHolder: ContextHolder[]): ContextData {
		this.retrievePreviousConfig();
		const result = this.applyNewConfig();

		return {
			status: StepStatus.SUCCESS,
			data: result
		};
	}

	protected rollbackLogic() {

	}
}