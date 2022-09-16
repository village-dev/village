use crate::lib::auth::get_token;

pub async fn token () {
    let token = get_token().await;
    println!("{}", token);
}