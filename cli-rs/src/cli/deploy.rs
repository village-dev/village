use crate::lib::auth::get_token;
use globset::{Glob, GlobSetBuilder};
use reqwest::header::AUTHORIZATION;
use reqwest::{multipart, Body, Client};
use serde::{Deserialize, Serialize};
use tempfile::NamedTempFile;
use tokio_util::codec::{BytesCodec, FramedRead};

use pathdiff;

use flate2::write::GzEncoder;
use flate2::Compression;

static DEFAULT_IGNORE: &'static [&'static str] = &[
    ".git",
    ".gitmodules",
    ".vscode",
    ".next",
    ".npm",
    ".venv",
    ".yarn",
    "__pycache__",
    "bin",
    "dist",
    "node_modules",
    "yarn-error.log",
    ".DS_Store",
];

#[derive(Debug, PartialEq, Serialize, Deserialize)]
struct Config {
    id: String,
}

pub async fn deploy() {
    let token = get_token();

    let cwd = std::env::current_dir().unwrap();

    // get config file in cwd or parents
    let mut folder_to_check = cwd.to_str().unwrap().to_owned();
    let mut has_config = false;

    while !has_config {
        let config_path = format!("{folder_to_check}/village.yaml");

        // check if village.yaml exists
        if std::path::Path::new(&config_path).exists() {
            has_config = true;
        } else {
            // check if we are at the root
            if folder_to_check == "/" {
                println!("No village.yaml found in this directory or any parent directory");
                return;
            }

            // go up a directory
            folder_to_check = std::path::Path::new(&folder_to_check)
                .parent()
                .unwrap()
                .to_str()
                .unwrap()
                .to_owned();
        }
    }

    let base_folder = folder_to_check;
    let config_path = format!("{base_folder}/village.yaml");
    let ignore_path = format!("{base_folder}/.villageignore");

    // read config
    let config_raw = std::fs::read_to_string(config_path).unwrap();
    let config: Config = serde_yaml::from_str(&config_raw).unwrap();

    let script_id = config.id;

    // read ignore file
    let ignore_contents = std::fs::read_to_string(ignore_path).unwrap();
    let ignore_contents = ignore_contents.split("\n").collect::<Vec<&str>>();
    let ignore = DEFAULT_IGNORE
        .iter()
        .chain(ignore_contents.iter())
        .map(|s| s.to_string())
        .collect::<Vec<String>>();

    // get negated and non-negated globs
    let nonnegated = ignore.iter().filter(|s| !s.starts_with("!"));
    let negated = ignore.iter().filter(|s| s.starts_with("!"));

    // build nonnegated matcher
    let mut nonnegated_matcher = GlobSetBuilder::new();
    for pattern in nonnegated {
        nonnegated_matcher.add(Glob::new(pattern).unwrap());
    }
    let nonnegated_matcher = nonnegated_matcher.build().unwrap();

    // build negated matcher
    let mut negated_matcher = GlobSetBuilder::new();
    for pattern in negated {
        negated_matcher.add(Glob::new(pattern).unwrap());
    }
    let negated_matcher = negated_matcher.build().unwrap();

    // compress files to temporary file
    let file = NamedTempFile::new().unwrap();
    let path = file.path();

    // build tarball
    let mut enc = GzEncoder::new(&file, Compression::default());
    {
        let mut tar = tar::Builder::new(&mut enc);

        // add all files to the tarball
        for entry in globwalk::GlobWalkerBuilder::from_patterns(&base_folder, &["**/*"])
            .build()
            .unwrap()
        {
            let entry = entry.unwrap();
            let path = entry.path().to_str().unwrap();
            let relative_path = pathdiff::diff_paths(path, &base_folder).unwrap();

            if !nonnegated_matcher.is_match(path) || negated_matcher.is_match(path) {
                tar.append_path_with_name(entry.path(), relative_path)
                    .unwrap();
            }
        }
    }

    // complete encoding
    enc.finish().unwrap();

    let file = tokio::fs::File::open(path).await.unwrap();

    // read file body stream
    let stream = FramedRead::new(file, BytesCodec::new());
    let file_body = Body::wrap_stream(stream);

    // create file stream
    let stream = multipart::Part::stream(file_body)
        .file_name("context.tar.gz")
        .mime_str("application/gzip")
        .unwrap();

    // creat form input
    let form = multipart::Form::new()
        .text("script_id", script_id)
        .part("context", stream);

    // post to api
    let res = Client::new()
        .post("http://localhost:8000/script/build")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .multipart(form)
        .send()
        .await;

    match res {
        Ok(r) => {
            println!("deployed");
        }
        Err(e) => {
            println!("error deploying: {:?}", e);
        }
    }
}
