## Cloud Data Import for Miro

Welcome to the Cloud Data Import for Miro repository! This script is designed to facilitate the visualization of AWS infrastructure data within Miro by importing cloud infrastructure snapshots directly into your Miro boards. This tool is ideal for cloud practitioners who want to leverage Miro's visualization capabilities to visualize and optimize their cloud infrastructure.

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

| Argument                | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `-r, --regions`         | Specify the AWS regions to scan. Use `"all"` to scan all available regions. |
| `-o, --output`          | Define the output file path for the imported data. Must be a `.json` file.  |
| `-rps, --call-rate-rps` | Set the maximum number of API calls to make per second. Default is 10.      |
| `-c, --compressed`      | Enable output compression.                                                  |
| `-ro, --regional-only`  | Limit the scan to regional services, ignoring global services.              |

#### Example Usage with Arguments

```sh
npx @mirohq/cloud-data-import@latest aws --regions us-east-1 us-west-2 --output ./data.json --call-rate-rps 5 --compressed
```

### 📜 License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for more details.
