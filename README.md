# tirolesa
[![Build Status](https://travis-ci.org/error418/tirolesa.svg?branch=master)](https://travis-ci.org/error418/tirolesa)
[![Maintainability](https://api.codeclimate.com/v1/badges/8842fffa3663f2260567/maintainability)](https://codeclimate.com/github/error418/tirolesa/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/8842fffa3663f2260567/test_coverage)](https://codeclimate.com/github/error418/tirolesa/test_coverage)


## Intention

Organizations have members, which may have the rights to create repositories.
Members therefore need to have the knowledge to configure these repositories to match
an existing standard configuration of the organization.

This may include for example:

- configuring protected branches
- adding extra issue labels
- Repository name conventions
- Approval configuration (successful build, etc.)

Defining templates and having a singe access point, which handles the repository creation
is a solution to this.

tirolesa offers a self-service to organization members to create repositories using templates.
Just choose the template matching your needs and put a repository name on it -
tirolesa will do the configuration work for you.

## Setup

tirolesa is a `GitHub App`. You need to *"install"* tirolesa on your organization and grant some rights to it,
so it can do the dirty work for you. Actions performed by tirolesa are marked with a `bot` tag in the GitHub UI.

### GitHub Enterprise Seats / Technical User

Since tirolesa is a GitHub App you won't need to waste a precious seat on a technical user. Yay!

## I want to host my own tirolesa

No Problem!

## Permissions

- `admin:org`
- `public_repo`

## Configuration

You can edit the configuration file `config.yml` to customize stuff to your liking. 

### Quick Start
The following example shows you how you can build the docker image and run the docker container by using the 'drun' command.


1. Source the environment 

        $ cd ./tirolesa
        $ . ./bashrc

2. Run the 'drun' command  

        $ tirolesa -v -i

   NOTE: After a successful container instantiation tirolesa is available on your box under http://localhost:3000
   
### Templates

Templates enable you to define a set of repository configurations. A organization member can choose a template from this set when creating a repository using tirolesa.

#### Repository Templates

Repository templates configure basic settings of the created repository. If you inspect the data structure of the `config` property, you will notice similarities to the [GitHub API](https://developer.github.com/v3/repos/#input). You can set every property described in the linked API documentation inside `config`. Be aware, that not every property will be displayed to the user in the tirolesa web interface.

##### Configurable Properties

- Repository name patterns (`pattern`, Regular Expression)
- Repository settings (`config`, see [GitHub API](https://developer.github.com/v3/repos/#input))
- Additional Issue labels (`label`, see [GitHub API](https://developer.github.com/v3/issues/labels/#parameters))

#### Branch Templates

Branch templates configure the initial branch protection settings of the repository. You can combine any defined Repository template with any Branch template. The `config` property has the same data structure as the GitHub API.

##### Configurable Properties

- Branch Protection settings (`config`, see [GitHub API](https://developer.github.com/v3/repos/branches/#parameters-1))


## Technobabble

tirolesa is written in `NodeJS` (backend) and `AngularJS` (frontend)






## Supporting the project

