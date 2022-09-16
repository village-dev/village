use api::{apis::scripts_api, models::CreateScriptInput};

use crate::lib;

pub async fn init() {
    let village_config = lib::auth::get_client_config().await;

    let create_script_input = CreateScriptInput {
        id: None,
        name: "test".to_owned(),
        description: None,
        workspace_id: "test".to_owned(),
        engine: api::models::Engine::Python,
        engine_version: "3.7".to_owned(),
    };

    let init = scripts_api::create_script(&village_config, create_script_input).await;

    match init {
        Ok(_) => println!("Script created successfully"),
        Err(e) => println!("Error: {}", e),
    }

    println!("init");
}
