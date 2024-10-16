## Cloud Data Import for Miro

![Miro Cloud View](/assets/images/cloudview-banner.gif)

Welcome to the Cloud Data Import for Miro! This script is designed to facilitate the visualization of AWS infrastructure data within Miro by importing cloud infrastructure snapshots directly into your Miro boards. The tool is an integral part of [Cloud View](https://help.miro.com/hc/en-us/articles/19893178414226-AWS-Cloud-View-BETA), an app in Miro that allows you to visualize and optimize your cloud infrastructure. Ideal for cloud practitioners, CloudView leverages Miro's powerful visualization capabilities to help you gain insights and improve your cloud management strategies.

### 🛠 Prerequisites

Before running the script, ensure the following prerequisites are met:

- **Node.js**: Ensure Node.js is installed on your machine. You can follow the [official Node.js installation guide](https://nodejs.org/en/download/) to set it up.
- **Configure AWS Credentials**: Configure your AWS credentials on your terminal. AWS provides a [comprehensive guide on setting up credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html).

### 📦 Installation and Usage

To run the script, execute the following command in your terminal:

```sh
npx @mirohq/cloud-data-import@latest aws
```

This command will automatically install and run the script, launching a GUI for interaction.

### ⚙️ Script Arguments and Configuration

The script accepts several arguments to customize the data import process:

| Argument                   | Description                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `-r, --regions`            | Specify the AWS regions to scan. Use `"all"` to scan all available regions.                    |
| `-p, --profile`            | Specify the AWS profile to use (takes priority over the AWS_PROFILE environment variable).     |
| `-o, --output`             | Define the output file path for the imported data. Must be a `.json` file.                     |
| `--rps, --call-rate-rps`   | Set the maximum number of API calls to make per second. Default is 10.                         |
| `-c, --compressed`         | Enable output compression.                                                                     |
| `-ro, --regional-only`     | Limit the scan to regional services, ignoring global services.                                 |
| `--ood, --open-output-dir` | Open the output directory and points to the output file, after the import process is complete. |

#### Example Usage with Arguments

```sh
npx @mirohq/cloud-data-import@latest aws --regions us-east-1 us-west-2 --output ./data.json --call-rate-rps 5 --compressed
```

### 📜 License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for more details.

### 🤝 Contributing

We welcome contributions to the Cloud Data Import project! If you're interested in helping improve this tool, please take a moment to review our [contribution guide](CONTRIBUTING.md). It outlines our development process, how to propose bugfixes and improvements, and how to build and test your changes.

Here are some ways you can contribute:

- Report bugs or suggest features by [opening an issue](https://github.com/miroapp/cloud-data-import/issues/new/choose)
- Improve documentations
- Submit pull requests with bug fixes or new features

We appreciate your interest in making Cloud Data Import tool better!
