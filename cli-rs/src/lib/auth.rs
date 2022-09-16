use api::{apis::{configuration::Configuration}};

pub fn get_token() -> String {
    let home_dir = dirs::home_dir().unwrap();
    let tokens = std::fs::read_to_string(home_dir.join(".village/tokens.json")).unwrap();
    let tokens: serde_json::Value = serde_json::from_str(&tokens).unwrap();
    tokens.get("access_token").unwrap().as_str().unwrap().to_owned()
}

pub fn get_client_config () -> Configuration {
    let mut village_config = Configuration::default();
    village_config.base_path = "http://localhost:8000".to_owned();
    village_config.bearer_access_token = Some(get_token());
    village_config
}