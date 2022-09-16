use crate::lib::auth::get_token;

pub fn token () {
    let token = get_token();
    println!("{}", token);
}