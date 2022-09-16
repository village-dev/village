use std::time::Duration;

use dirs;
use reqwest;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{BufWriter, Write};
use tokio;
use tokio::time;

static AUTH0_DOMAIN: &'static str = env!("AUTH0_DOMAIN");
static AUTH0_CLIENT_ID: &'static str = env!("AUTH0_CLIENT_ID");
static AUTH0_AUDIENCE: &'static str = env!("AUTH0_AUDIENCE");


#[derive(Deserialize, Debug)]
struct GetCodeResponse {
    device_code: String,
    user_code: String,
    verification_uri: String,
    expires_in: i32,
    interval: i32,
    verification_uri_complete: String,
}

#[derive(Deserialize, Debug, Serialize)]
struct GetTokenResponse {
    access_token: String,
    refresh_token: String,
}

pub async fn login() {
    let client = reqwest::Client::new();

    let response = client
        .post(format!("{AUTH0_DOMAIN}/oauth/device/code"))
        .form(&[
            ("client_id", env!("AUTH0_CLIENT_ID")),
            ("audience", env!("AUTH0_AUDIENCE")),
            ("scope", "openid profile email offline_access"),
        ])
        .send()
        .await
        .expect("Error getting code");

    let code = response
        .json::<GetCodeResponse>()
        .await
        .expect("Error parsing code");

    let GetCodeResponse {
        verification_uri_complete,
        device_code,
        user_code,
        ..
    } = code;

    println!("Go to {verification_uri_complete}");
    println!("Confirm that the code is {user_code}");

    let mut interval = time::interval(Duration::from_millis(1000));

    let client = reqwest::Client::new();

    let tokens = loop {
        interval.tick().await;
        let res = client
            .post(&format!("{AUTH0_DOMAIN}/oauth/token"))
            .form(&[
                ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
                ("device_code", &device_code),
                ("client_id", AUTH0_CLIENT_ID),
                ("audience", AUTH0_AUDIENCE),
            ])
            .send()
            .await;

        match res {
            Ok(res) => {
                if res.status().is_success() {
                    let tokens = res.json::<GetTokenResponse>().await;
                    break tokens;
                }
            }
            Err(e) => {
                println!("Error: {:?}", e);
            }
        }
    };

    match tokens {
        Ok(tokens) => {
            let home_dir = dirs::home_dir().unwrap();
            fs::create_dir_all(home_dir.join(".village")).unwrap();

            // write tokens to file
            let file = std::fs::File::create(home_dir.join(".village/tokens.json")).unwrap();
            serde_json::to_writer_pretty(file, &tokens).unwrap();

            println!("Successfully logged in!");
        }
        Err(e) => {
            println!("Error: {:?}", e);
        }
    }
}
