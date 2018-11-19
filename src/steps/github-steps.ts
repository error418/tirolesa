import { Step, ContextHolder, ContextData, StepStatus } from "arroyo";
import { } from "@octokit/rest";
import * as GitHub from "@octokit/rest";



export class CreateRepositoryStep extends Step {
	private repoConfig: GitHub.ReposCreateParams;

	constructor(repoConfig: GitHub.ReposCreateParams) {
		super();
		this.repoConfig = repoConfig;
	}

	private async createRepository() {
		const client = new GitHub();
		return await client.repos.create(this.repoConfig);
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

export class BranchProtectionStep extends Step {
	private targetConfig: any;
	private currentConfig: any;

	constructor(targetConfig: any) {
		super();
		this.targetConfig = targetConfig;
	}

	protected executeLogic(contextHolder: ContextHolder[]): ContextData {

		return {
			status: StepStatus.SUCCESS
		};
	}

	protected rollbackLogic() {

	}
}