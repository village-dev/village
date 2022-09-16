use api::apis::configuration::Configuration;
use base64;
use chrono;
use serde::{Deserialize, Serialize};

static AUTH0_DOMAIN: &'static str = env!("AUTH0_DOMAIN");

#[derive(Deserialize, Debug, Serialize)]
struct RefreshTokenResponse {
    id_token: String,
    access_token: String,
}

pub async fn get_token() -> String {
    let home_dir = dirs::home_dir().unwrap();
    let tokens_file = home_dir.join(".village/tokens.json");
    let tokens = std::fs::read_to_string(&tokens_file).unwrap();
    let mut tokens: serde_json::Value = serde_json::from_str(&tokens).unwrap();
    let access_token = tokens
        .get("access_token")
        .unwrap()
        .as_str()
        .unwrap()
        .to_owned();

    let exp = access_token.split(".").nth(1).unwrap();
    let exp = base64::decode(exp).unwrap();
    let exp: serde_json::Value = serde_json::from_slice(&exp).unwrap();
    let exp = exp.get("exp").unwrap().as_u64().unwrap();

    let now = chrono::Utc::now().timestamp() as u64;

    if now < exp {
        let refresh_token = tokens
            .get("refresh_token")
            .unwrap()
            .as_str()
            .unwrap()
            .to_owned();

        let res = reqwest::Client::new()
            .post(format!("{AUTH0_DOMAIN}/oauth/token"))
            .form(&[
                ("client_id", env!("AUTH0_CLIENT_ID")),
                ("grant_type", "refresh_token"),
                ("refresh_token", &refresh_token),
            ])
            .send()
            .await;

        match res {
            Ok(res) => {
                if res.status().is_success() {
                    let new_tokens = res.json::<RefreshTokenResponse>().await;
                    let access_token = new_tokens.unwrap().access_token;

                    // update tokens.json
                    tokens.as_object_mut().unwrap().insert(
                        "access_token".to_owned(),
                        serde_json::Value::String(access_token.clone()),
                    );

                    // write to file
                    let file = std::fs::File::create(&tokens_file).unwrap();
                    serde_json::to_writer_pretty(file, &tokens).unwrap();

                    return access_token;
                } else {
                    panic!("Error getting token");
                }
            }
            Err(e) => {
                println!("Error: {:?}", e);
                panic!("Error getting token");
            }
        }
    } else {
        access_token
    }
}

pub async fn get_client_config() -> Configuration {
    let mut village_config = Configuration::default();
    village_config.base_path = "http://localhost:8000".to_owned();
    village_config.bearer_access_token = Some(get_token().await);
    village_config
}
