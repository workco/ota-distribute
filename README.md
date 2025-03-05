# ★★ ota-distribute

`ota-distribute` is a command-line tool for distributing OTA (Over-The-Air) builds of iOS and Android applications. It automates the creation of a static website for your build, and then copies it to a specified destination such as an S3 bucket or a local folder. The generated website can be used to serve and install your app.

## Key Features

- **Automatic App Info Parsing:**  
  Reads your `.ipa` or `.apk` file and extracts relevant metadata like app name, identifier, and type.

- **Static Site Generation:**  
  Creates a static website that provides a simple interface for downloading and installing the build on devices.

- **Flexible Distribution:**  
  Choose between Amazon S3 for cloud hosting or local folder output for testing and custom hosting solutions.

- **Customizable Base URLs:**  
  Easily set the base URL of the generated site, so all links and assets work seamlessly on your chosen host.

## Installation & Usage

### Quick Start with `npx`

You can run `ota-distribute` on-the-fly without installing it globally:

```bash
$ npx ota-distribute <path-to-ipa-or-apk> [options]
```

**Example:**

```bash
$ npx ota-distribute myApp.ipa --destination s3 --base-url https://myapp.com/ --aws-bucket my-app-bucket --aws-region us-east-1
```

This will:

1. Parse the `.ipa` for app details.
2. Build a static site.
3. Upload the site to the specified S3 bucket.
4. Print out a success message with a URL where users can download the app OTA.

## Arguments & Options

**Arguments:**

| Argument | Description |
|----------|-------------|
| `<path>` | **Required.** Path to the `.ipa` or `.apk` file. |

**Options:**

| Option | Description | Details |
|--------|-------------|---------|
| `-d, --destination <destination>` | **Required.** Where to place the generated website. | Choices: `s3`, `folder` |
| `-b, --base-url <baseUrl>` | The website's base URL. This is required so that generated links and resources work as intended. | URL Format |
| `-o, --out-dir <outDir>` | Local output directory. Only used when `destination` is `folder`. | Path Format<br>Example: `./public` |
| `-ar, --aws-region <awsRegion>` | AWS region for your S3 bucket. Only used when `destination` is `s3`. | AWS Region<br>Example: `us-east-1` |
| `-ab, --aws-bucket <bucket>` | The S3 bucket name for uploading the site. Only used when `destination` is `s3`. | S3 Bucket Name<br>Example: `my-ota-bucket` |

## Examples

**1. Distribute to S3:**

```bash
npx ota-distribute ./path/to/myApp.ipa \
  --destination s3 \
  --base-url https://myapp.example.com/ \
  --aws-bucket my-ota-bucket \
  --aws-region us-east-1
```

**2. Distribute to a Local Folder:**

```bash
npx ota-distribute ./path/to/myApp.apk \
  --destination folder \
  --base-url http://localhost:8080/ \
  --out-dir ./public
```

## Error Handling & Troubleshooting

- **Missing Base URL:**  
  If you skip `--base-url`, you’ll see:
  ```  
  Error: -b / --base-url is required for the chosen destination
  ```
  Always provide a valid base URL.

- **AWS Setup Issues:**  
  Ensure that your AWS credentials, bucket configuration, and region settings are correct. Use the AWS CLI or environment variables to manage credentials and permissions as needed.

## License

© 2025 Accenture. License: [Apache License, Version 2.0](./LICENSE)